// @ts-check

const { Command } = require('commander');
const { getMenuFromReadme } = require('../utils/getMenuFromReadme');
const renderArticle = require('../utils/renderArticle');
const fs = require('fs/promises')
const path = require('path')
const ejs2html = require('../utils/ejs2html');
const getConfig = require('../utils/getConfig');
const { get } = require('lodash');
const program = new Command();
const copyDir = require('../utils/copyDir');
const chalk = require('chalk');

program.option('-d, --dist <dist>', '打包输出目录, 默认为dist');

async function run() {
  const config = await getConfig();
  const options = program.opts();
  const dir = options.dist || 'dist'
  const menu = await getMenuFromReadme();
  // 先清除旧的文件
  await fs.rm(dir, { recursive: true, force: true });
  // 然后新建html页面
  await fs.mkdir(dir);
  await fs.mkdir(`${dir}/article`);
  for (let i = 0; i < menu.length; i++) {
    for (let j = 0; j < menu[i].subList.length; j++) {
      const article = menu[i].subList[j];
      const articleHtml = await renderArticle(article.filepath, article);
      await fs.writeFile(`${dir}/article/${article.filename}.html`, articleHtml);
    }
  }
  // 将首页转成html文件
  const indexHtml = await ejs2html(
    get(config, 'templates.index') || path.resolve(__dirname, '../templates/index.ejs'),
    {
      list: menu,
      config
    }
  );
  await fs.writeFile(`${dir}/index.html`, indexHtml);
  await copyDir('images', `${dir}/images`);
  console.log(chalk.green('构建成功!'));
}

program.parseAsync(process.argv).then(run);