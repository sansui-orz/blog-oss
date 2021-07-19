// @ts-check
const markdown2html = require('markdown-into-html');
const path = require('path');
const ejs = require('ejs');
const crypto = require('crypto');
const { get } = require('lodash');

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
  return htmlStr
    .replace(/language-tsx/g, 'javascript')
    .replace(/\.\/(.*)\.md/g, function (str, targetStr) {
      return str.replace(`${targetStr}.md`, crypto.createHash('md5').update(decodeURIComponent(targetStr)).digest('hex'));
    })
};

/**
 *
 * @param {string} filePath
 * @param {ArticleInfo} articleInfo
 * @param {any} config
 * @return {Promise<string>}
 */
exports.renderArticle = async (filePath, articleInfo, config) => {
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
    { async: true },
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