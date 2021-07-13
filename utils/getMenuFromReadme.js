// @ts-check

const path = require('path');
const { readFile } = require('fs/promises');
const fs = require('fs');
const { getFileIfExist } = require('./fsTools');
const { readmeIsUndefined, parseArticleFail } = require('./errorLog');
const { Octokit } = require('@octokit/core');
const readline = require('readline');
const _crypto = require('crypto');
const { once } = require('events');

// const octokit = new Octokit({ auth: token });

/**
 * @typedef { import('./types.js').ArticleInfo } ArticleInfo
 * @typedef { import('./types.js').IndexMenu } IndexMenu
 */

/**
 * 创建文章关联issue，用于Gitalk评论组件
 * @param {string} title
 * @param {string} id
 */
const createArticlesIssues = async (title, id) => {
  // try {
  //   await octokit.request('POST /repos/sansui-orz/blog/issues', {
  //     owner: 'sansui-orz',
  //     repo: 'blog',
  //     title: `【${title}】的评论`,
  //     body: `使用github api统一生成: https://docs.github.com/en/rest/reference/issues#create-an-issue
  //     进入博客拥有更好体验: https://www.lmsdelck.xyz/blog/article/${id}`,
  //     labels: ['Gitalk', id]
  //   });
  // } catch {

  // }
  // 关联创建的issues
  console.log('关联创造的issues', title, id);
};

exports.createArticlesIssues = createArticlesIssues;

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
    return {
      year,
      month,
      day,
      tags,
      menu,
      title,
      id,
      filepath,
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

      // TODO: 创建issues
      return {
        id,
        ...articleDetail,
        filepath,
        title: _matchObj[1]
      };
    });
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