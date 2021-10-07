// @ts-check
const markdown2html = require('markdown-into-html');
const path = require('path');
const ejs = require('ejs');
const crypto = require('crypto');
const { get } = require('lodash');
const getConfig = require('./getConfig');
const cheerio = require('cheerio');

const articleTemplatePath = path.resolve(__dirname, '../templates/article.ejs');

/**
 * @typedef { import('./types.js').ArticleInfo } ArticleInfo
 */

/**
 * 装饰html, 对markdown转成的html内容进行二次修正
 * @param {string} htmlStr
 * @return {string}
 */
const decoreteHtml = (htmlStr) => {
  const html = htmlStr
    .replace(/language-tsx/g, 'javascript')
    .replace(/\.\/(.*)\.md/g, function (str, targetStr) {
      return str.replace(`${targetStr}.md`, crypto.createHash('md5').update(decodeURIComponent(targetStr)).digest('hex'));
    })
  const $ = cheerio.load(html);
  ['h2', 'h3', 'h4'].forEach(tag => {
    $(tag).each(function (i, elem) {
      const id = crypto.createHash('md5').update($(this).text()).digest('hex');
      $(this).attr('id', id);
    });
  })
  return $.html();
};

/**
 * 将文章markdown渲染成html
 * @param {string} filePath 文件路径
 * @param {ArticleInfo} articleInfo 文章信息
 * @return {Promise<string>} 返回html内容
 */
module.exports = async (filePath, articleInfo) => {
  const config = await getConfig()
  const htmlCode = await markdown2html({
    path: filePath,
    url: undefined,
    options: {
      linkify: false
    }
  });
  const articleHtml = await new Promise((resolve, reject) => ejs.renderFile(
    get(config, 'templates.article') || articleTemplatePath,
    {
      ...articleInfo,
      body: decoreteHtml(htmlCode),
      config
    },
    // { async: true },
    function(err, str){
      // str => 输出渲染后的 HTML 字符串
      if (err) {
        reject(err);
        return;
      }
      resolve(str);
  }));
  return articleHtml;
};