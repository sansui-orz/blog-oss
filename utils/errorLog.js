const chalk = require('chalk');

exports.accessKeyIdIsUndefined = () => {
  console.log(chalk.bold(chalk.red('【部署失败】')));
  console.log(chalk.red('  缺少accessKeyID, 请通过配置文件configs/config.private.js指定oss配置'));
  console.log(chalk.yellow(`  例:
      exports.oss = {
        ...
        accessKeyID: 'accessKeyID'
      };
  `));
};

exports.accessKeySecretIsUndefined = () => {
  console.log(chalk.bold(chalk.red('【部署失败】')));
  console.log(chalk.red('  缺少accessKeySecret, 请通过配置文件configs/config.private.js指定oss配置'));
  console.log(chalk.yellow(`  例:
      exports.oss = {
        ...
        accessKeySecret: 'accessKeySecret'
      };
  `));
};

exports.regionIsUndefined = () => {
  console.log(chalk.bold(chalk.red('【部署失败】')));
  console.log(chalk.red('  缺少region, 请通过配置文件configs/config.private.js指定oss配置'));
  console.log(chalk.yellow(`  例:
      exports.oss = {
        ...
        region: 'oss-cn-guangzhou'
      };
  `));
};

exports.bucketNameIsUndefined = () => {
  console.log(chalk.bold(chalk.red('【部署失败】')));
  console.log(chalk.red('  缺少bucketName, 请通过配置文件configs/config.private.js指定oss配置'));
  console.log(chalk.yellow(`  例:
      exports.oss = {
        ...
        bucketName: 'blog'
      };
  `));
};

exports.deployFail = (e) => {
  console.log(chalk.bold(chalk.red('【部署失败】')));
  console.log(chalk.red('  部署发生错误，错误详情为:'));
  console.log(e);
};

exports.readmeIsUndefined = () => {
  console.log(chalk.bold(chalk.red('【部署失败】')));
  console.log(chalk.red('  未找到README.md文件'));
};

exports.parseArticleFail = (filename, error) => {
  console.log(chalk.bold(chalk.red('【部署失败】')));
  console.log(chalk.red(`  解析文章${filename}失败! error: ${error}`));
};

exports.writeFileFail = (error) => {
  console.log(chalk.bold(chalk.red('【部署失败】')));
  console.log(chalk.red(`  写入文件失败: ${error}`));
};