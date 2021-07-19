// @ts-check

const { Command } = require('commander');
const path = require('path');
const { createOssClient, isExistObject, pushObject } = require('../utils/oss');
const { getMenuFromReadme } = require('../utils/getMenuFromReadme');
const { renderArticle } = require('../utils/renderArticle');
const { get } = require('lodash');
const chalk = require('chalk');
const ejs = require('ejs');
const getConfig = require('../utils/getConfig');
const updateImages = require('../utils/updateImages');
const crypto = require('crypto');
const { Octokit } = require('@octokit/core');
const {
  accessKeyIdIsUndefined,
  accessKeySecretIsUndefined,
  regionIsUndefined,
  bucketNameIsUndefined,
  deployFail
} = require('../utils/errorLog');


const program = new Command();

program.option('-oid, --oss-access-key-id <ossAccessKeyId>', '阿里云OSS AccessKeyId')
  .option('-osecret, --oss-access-key-secret <ossAccessKeySecret>', '阿里云OSS AccessKeySecret')
  .option('-gtoken, --github-personal-access-token <personalAccessToken>', 'Github OAuth Token');

async function run() {
  try {

    const options = program.opts();

    console.log('查看options', options);
    const config = await getConfig();
    const githubPersonalAccessToken = options.personalAccessToken || config.github.personalAccessToken;
    delete config.github.personalAccessToken;
    const octokit = new Octokit({ auth: githubPersonalAccessToken });
    console.log(chalk.green('博客开始构建,配置为: '), config);
    if (!get(config, 'oss.accessKeyId') && !options.ossAccessKeyId) {
      accessKeyIdIsUndefined();
      return;
    }
    if (!get(config, 'oss.accessKeySecret') && !options.ossAccessKeySecret) {
      accessKeySecretIsUndefined();
      return;
    }
    if (!get(config, 'oss.region')) {
      regionIsUndefined();
      return;
    }
    if (!get(config, 'oss.bucketName')) {
      bucketNameIsUndefined();
      return;
    }
    const { region, accessKeyId, accessKeySecret, bucketName } = config.oss;
    const ossClient = createOssClient(region, options.ossAccessKeyId || accessKeyId, options.ossAccessKeySecret || accessKeySecret, bucketName);
    // 将blog的相关信息存储在oss上。
    const blogConfigIsExist = await isExistObject('blog.online.config.json');
    let blogOnlineConfig = {};
    if (blogConfigIsExist) {
      // @ts-ignore
      const res = await ossClient.get('blog.online.config.json')
      // @ts-ignore
      blogOnlineConfig = JSON.parse(res.res.data.toString());
      delete blogOnlineConfig.res;
      delete blogOnlineConfig.content;
    }
    const configStr = JSON.stringify(blogOnlineConfig);
    const menu = await getMenuFromReadme();
    const indexTemplatePath = path.resolve(__dirname, '../templates/index.ejs');
    const indexHtml = await new Promise((resolve, reject) => ejs.renderFile(
      get(config, 'templates.index') || indexTemplatePath,
      {
        list: menu,
        config
      },
      { async: true },
      function(err, str){
        // str => 输出渲染后的 HTML 字符串
        if (err) {
          reject(err);
          return;
        }
        resolve(str);
    }));

    const contentHash = crypto.createHash('md5').update(indexHtml).digest('hex');
    if (contentHash !== blogOnlineConfig['index']) {
      console.log(chalk.green('正在上传更新index.html...'));
      blogOnlineConfig['index'] = contentHash;
      await pushObject('index.html', indexHtml);
      console.log(chalk.green('index.html已完成, 开始生成并上传文章...'));
    }

    // 渲染所有文章
    let updateArticleCount = 0;
    for (let i = 0; i < menu.length; i++) {
      for (let j = 0; j < menu[i].subList.length; j++) {
        const article = menu[i].subList[j];
        const articleHtml = await renderArticle(article.filepath, article, config);
        const articleContentHash = crypto.createHash('md5').update(articleHtml).digest('hex');
        if (blogOnlineConfig[article.id] !== articleContentHash) {
          try {
            await pushObject(`article/${article.id}.html`, articleHtml);
            await octokit.request(`POST /repos/${get(config, 'github.owner')}/${get(config, 'github.repo')}/issues`, {
              owner: get(config, 'github.owner'), // github仓库所有者
              repo: get(config, 'github.repo'), // github仓库名
              title: `【${article.title}】的评论`, // issues的标题
              body: `使用github api统一生成: https://docs.github.com/en/rest/reference/issues#create-an-issue`, // issues的内容
              labels: ['Gitalk', article.id]
            });
            blogOnlineConfig[article.id] = articleContentHash;
            updateArticleCount++;
          } catch {
            console.log(chalk.red('【更新文章异常】: 文章: ' + article.title));
          }
        }
      }
    }
    console.log(chalk.green(`${updateArticleCount}篇有变更文章已更新! 开始检查上传图片文件`));
    await updateImages();
    console.log(chalk.green('图片资源已上传，开始更新配置记录文件: blog.online.config.json'));
    if (JSON.stringify(blogOnlineConfig) !== configStr) {
      await pushObject('blog.online.config.json', JSON.stringify(blogOnlineConfig));
    }
    console.log(chalk.green('博客部署完成!'));
  } catch (error) {
    deployFail(error);
  }
}

program.parseAsync(process.argv).then(run);

