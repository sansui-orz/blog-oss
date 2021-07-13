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
const {
  accessKeyIdIsUndefined,
  accessKeySecretIsUndefined,
  regionIsUndefined,
  bucketNameIsUndefined,
  deployFail
} = require('../utils/errorLog');


const program = new Command();

async function run() {
  try {
    const config = await getConfig();
    console.log(chalk.green('博客开始构建,配置为: '), config);
    if (!get(config, 'oss.accessKeyId')) {
      accessKeyIdIsUndefined();
      return;
    }
    if (!get(config, 'oss.accessKeySecret')) {
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
    const ossClient = createOssClient(region, accessKeyId, accessKeySecret, bucketName);
    // 将blog的相关信息存储在oss上。
    const blogConfigIsExist = await isExistObject('blog.online.config.json');
    let blogOnlineConfig = {};
    if (blogConfigIsExist) {
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
        const articleHtml = await renderArticle(menu[i].subList[j].filepath, menu[i].subList[j], config);
        const articleContentHash = crypto.createHash('md5').update(articleHtml).digest('hex');
        if (blogOnlineConfig[menu[i].subList[j].id] !== articleContentHash) {
          blogOnlineConfig[menu[i].subList[j].id] = articleContentHash;
          updateArticleCount++;
          await pushObject(`article/${menu[i].subList[j].id}.html`, articleHtml);
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

