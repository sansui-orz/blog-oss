// @ts-check

const path = require('path');
const { readFile } = require('fs/promises');
const fs = require('fs');
const { getFileIfExist } = require('./fsTools');
const { readmeIsUndefined, parseArticleFail } = require('./errorLog');
const readline = require('readline');
const _crypto = require('crypto');
const { once } = require('events');


/**
 * @typedef { import('./types.js').ArticleInfo } ArticleInfo
 * @typedef { import('./types.js').IndexMenu } IndexMenu
 */

/**
 * 解析具体的markdown文章，得到标题与目录
 * @param {string} filepath
 * @param {string} id
 * @returns {Promise<ArticleInfo>}
 */
const matchArticleDetail = async (filepath, id) => {
  try {
    const res = await readFile(filepath);
    const fileContent = res.toString();
    const createMatch = fileContent.match(/\[create\]:(\d{4})-(\d{2})-(\d{2})/);
    const [_, year, month, day] = createMatch || [];
    const tagMatch = fileContent.match(/\[tag\]:(.+)\n/);
    const tags = tagMatch[1].split('|');
    const title = fileContent.match(/^#\s(.*)/)[1];
    const menu = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filepath),
      crlfDelay: Infinity
    });
    rl.on('line', (line) => {
      // 处理行。
      if (/^(#{2,4})\s(.*)/.test(line)) {
        const match = line.match(/^(#{2,4})\s(.*)/);
        menu.push({
          title: match[2],
          level: match[1].length - 1,
          id: _crypto.createHash('md5').update(match[2]).digest('hex'),
        });
      }
    });
    await once(rl, 'close');
    const contentHash = _crypto.createHash('md5').update(fileContent).digest('hex')
    return {
      year,
      month,
      day,
      tags,
      menu,
      title,
      id,
      filepath,
      contentHash: contentHash,
      // 使用id + contentHash + issues状态的方式决定内容是否变更
      filename: `${id}-${contentHash}-0` // 0: issues未初始化, 1: issues已初始化
    };
  } catch (error) {
    parseArticleFail(filepath, error);
    throw new Error('解析文章失败: ' + filepath);
  }
}

/**
 * 从README.md中获取博客目录
 * @returns {Promise<IndexMenu>}
 */
exports.getMenuFromReadme = async () => {
  if (await getFileIfExist(path.resolve('README.md'))) {
    const listStr = (await readFile(path.resolve('README.md'))).toString();
    const matchObj = listStr.match(/- \[.+\]\(.+\.md\)\n/g);
    const list = matchObj.map(async item => {
      const _matchObj = item.match(/^-\s\[(.+)\]\((.+)\)/);
      const filepath = path.resolve(_matchObj[2]);
      const id = _crypto.createHash('md5').update(_matchObj[1]).digest('hex');
      const articleDetail = await matchArticleDetail(filepath, id);

      return {
        id,
        ...articleDetail,
        filepath,
        title: _matchObj[1]
      };
    });
    // 将生成的目录进行排序，顺序为 最近 > 最久
    const sortList = (await Promise.all(list)).sort((pre, nxt) => {
      const arr = ['year', 'month', 'day'];
      for (let i = 0; i < 3; i++) {
        if (+pre[arr[i]] > +nxt[arr[i]]) {
          return -1;
        } else if (+pre[arr[i]] < +nxt[arr[i]]) {
          return 1;
        }
      }
      return 0;
    });
    let year = sortList[0].year;

    /** @type {ArticleInfo[]} */
    let tempSubList = [];
    let newList = [{
      year,
      subList: tempSubList
    }];
    for (let i = 0; i < sortList.length; i++) {
      if (sortList[i].year !== year) {
        year = sortList[i].year
        tempSubList = [];
        newList.push({
          year: sortList[i].year,
          subList: tempSubList,
        });
      }
      tempSubList.push(sortList[i]);
    }
    return newList;
  } else {
    readmeIsUndefined();
    throw new Error('未找到README');
  }
};