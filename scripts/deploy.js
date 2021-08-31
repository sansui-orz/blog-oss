// @ts-check

const { Command } = require('commander');
const path = require('path');
const { createOssClient, pushObject } = require('../utils/oss');
const { getMenuFromReadme } = require('../utils/getMenuFromReadme');
const { renderArticle } = require('../utils/renderArticle');
const { get } = require('lodash');
const chalk = require('chalk');
const ejs2html = require('../utils/ejs2html');
const getConfig = require('../utils/getConfig');
const updateImages = require('../utils/updateImages');
const {
  accessKeyIdIsUndefined,
  accessKeySecretIsUndefined,
  regionIsUndefined,
  bucketNameIsUndefined,
  deployFail
} = require('../utils/errorLog');
const updateArticles = require('../utils/updateArticles');

const program = new Command();

program.option('-oid, --oss-access-key-id <ossAccessKeyId>', '阿里云OSS AccessKeyId')
  .option('-osecret, --oss-access-key-secret <ossAccessKeySecret>', '阿里云OSS AccessKeySecret')
  .option('-gtoken, --github-personal-access-token <personalAccessToken>', 'Github OAuth Token');

async function run() {
  try {
    const options = program.opts();

    const config = await getConfig();
    const githubPersonalAccessToken = options.personalAccessToken || config.github.personalAccessToken;
    delete config.github.personalAccessToken;
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
    createOssClient(region, options.ossAccessKeyId || accessKeyId, options.ossAccessKeySecret || accessKeySecret, bucketName);

    const menu = await getMenuFromReadme();

    // 渲染所有文章
    await updateArticles(menu, {
      githubPersonalAccessToken
    });

    // 将首页转成html文件
    const indexHtml = await ejs2html(
      get(config, 'templates.index') || path.resolve(__dirname, '../templates/index.ejs'),
      {
        list: menu,
        config
      }
    )
    await pushObject('index.html', indexHtml);
    
    console.log(chalk.green('文章部署成功，开始上传图片资源'));
    await updateImages();
    console.log(chalk.green('图片资源已上传!'));
    console.log(chalk.green('博客部署完成!'));
  } catch (error) {
    deployFail(error);
  }
}

program.parseAsync(process.argv).then(run);

