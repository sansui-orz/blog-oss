#!/usr/bin/env node

const chalk = require('chalk');
const figlet = require('figlet');
const { Command } = require('commander');
const pkgConfig = require('./package.json');

const program = new Command();
program
  .version(pkgConfig.version)
  .arguments('<projectName>')
  .description('初始化博客项目')
  .action((projectName) => {
    console.log('projectName', projectName, '__dirname', __dirname);
  });

program.option('-c, --config <filepath>', '添加一个配置文件，默认配置文件为blog-oss.config.json', 'blog-oss.config.json');

program.command('deploy', '一键部署到阿里云OSS上', { executableFile: 'scripts/deploy.js' });

program.command('test')
  .action(() => {
    console.log('in test', arguments);
  });

/* 打印LOGO */
console.log(chalk.yellow(figlet.textSync(`Blog-OSS v-${pkgConfig.version}`, {
  horizontalLayout: 'full'
})));

program.parse(process.argv);