const { Command } = require('commander');
const copyDir = require('../utils/copyDir');
const { initProjectFail } = require('../utils/errorLog');
const chalk = require('chalk');
const path = require('path');

const program = new Command();

program.parseAsync(process.argv).then(async () => {
  const pkgs = program.args;

  if (!pkgs[0]) {
    initProjectFail();
    return;
  }

  await copyDir(path.join(__dirname, '../default-blog'), pkgs[0]);
  console.log(chalk.green(`✅ 初始化项目成功，请 cd ${pkgs[0]} 开始编写你的博客吧。`));
});