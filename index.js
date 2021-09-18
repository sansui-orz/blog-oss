#!/usr/bin/env node

const chalk = require('chalk');
const figlet = require('figlet');
const { Command } = require('commander');
const pkgConfig = require('./package.json');
const copyDir = require('./utils/copyDir');
const path = require('path');

const program = new Command();

program
  .version(pkgConfig.version)
  .arguments('<projectName>')
  .description(`一个将github的markdown博客转换发布到阿里云OSS的工具库`)
  .action(async (projectName) => {
    await copyDir(path.join(__dirname, './default-blog'), projectName);
    console.log(chalk.green(`✅ 初始化项目成功，请 cd ${projectName} 开始编写你的博客吧。`));
  });


program.command('deploy', '一键部署到阿里云OSS上', { executableFile: 'scripts/deploy.js' });
program.command('build', '打包(markdown to html), 不会做初始化issues, 上传oss操作', { executableFile: 'scripts/build.js' });
program.command('init <projectName>', '初始化项目', { executableFile: 'scripts/init.js' }).alias('i');


/* 打印LOGO */
console.log(chalk.yellow(figlet.textSync(`Blog-OSS`, {
  horizontalLayout: 'full'
})));
console.log(chalk.yellow(`版本: ${pkgConfig.version}\n\n`));

program.parse(process.argv);