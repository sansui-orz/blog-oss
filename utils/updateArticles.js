const { getArticles, delArticle, pushObject } = require('./oss')
const { Octokit } = require('@octokit/core');
const { get } = require('lodash');
const getConfig = require('./getConfig')
const chalk = require('chalk');
const renderArticle = require('./renderArticle')

/**
 * 创建github issues
 * @param {Octokit} octokit 实例
 * @param {string} title 文章标题
 * @param {string} id 文章id
 * @returns {0|1} 1：创建成功，0: 创建失败
 */
async function initIssues(octokit, title, id) {
  try {
    const config = await getConfig()
    await octokit.request(`POST /repos/${get(config, 'github.owner')}/${get(config, 'github.repo')}/issues`, {
      owner: get(config, 'github.owner'), // github仓库所有者
      repo: get(config, 'github.repo'), // github仓库名
      title: `【${title}】的评论`, // issues的标题
      body: `使用github api统一生成: https://docs.github.com/en/rest/reference/issues#create-an-issue`, // issues的内容
      labels: ['Gitalk', id]
    });
    return 1
  } catch(error) {
    console.log(chalk.red('【创建issues失败】: 文章: ' + title))
    console.log('error=>', error)
    return 0
  }
}

async function updateArticle(article) {
  await pushObject(`article/${article.filename}.html`, article.html, {
    'Cache-Control': 'public, max-age=31536000'
  })
}

/**
 * 批量更新文章
 * @param {import('./types.js').IndexMenu} menu 文章目录
 * @param {{ githubPersonalAccessToken: string; }} params 额外参数
 */
module.exports = async function (menu, params) {
  const list = await getArticles()
  // 首先获取oss上的文章列表
  const ossArticlesList = list.objects.filter(item => /^article\/(\w+)-(\w+)-[01].html$/.test(item.name)).map(item => {
    const filename = item.name.split('/')[1].replace('.html', '')
    return {
      originName: item.name,
      filename: filename,
      id: filename.match(/^(\w+)-/)[1],
      initIssues: +filename.match(/-(0|1)$/)[1],
      hashId: filename.replace(/-[01]$/, '')
    }
  })

  const octokit = new Octokit({ auth: params.githubPersonalAccessToken });

  const createIssues = async (article) => {
    const inited = await initIssues(octokit, article.title, article.id)
    article.filename = `${article.id}-${article.contentHash}-${inited}`
    return inited
  }

  // 对比更新所有oss上的内容
  for (let i = 0; i < menu.length; i++) {
    for (let j = 0; j < menu[i].subList.length; j++) {
      const article = menu[i].subList[j];

      // 如果线上没有这篇文章(文件名强匹配, 有则标识文章未更新)，则上传并更新
      const articleNoUpdate = ossArticlesList.find(item => item.hashId === article.hashId)
      if (!articleNoUpdate) {
        // 根据文章id查找是否存在这篇文章的issues
        // 线上有这篇文章（内容有更新）
        const articleHasUpdate = ossArticlesList.find(item => item.id === article.id)
        if (articleHasUpdate) {
          // 删除线上多余文章
          delArticle(articleHasUpdate.originName)
          console.log('文章内容有更新: ', article.title)
          if (articleHasUpdate.initIssues === 1) {
            // 已经创建了issues
            article.filename = `${article.id}-${article.contentHash}-1`
          } else {
            // 还没创建issues
            await createIssues(article)
          }
          await updateArticle(article)
        } else {
          console.log('创建文章: ', article.title)
          // 没有这篇文章
          // 创建issues
          await createIssues(article)
          await updateArticle(article)
        }
      } else if (articleNoUpdate.initIssues === 0) {
        console.log('给已有文章: ', article.title, ', 创建issues')
        // 有这篇文章，但是文章issues创建失败了(没有issues)
        const inited = await createIssues(article)
        if (inited) {
          // 创建了issues，则更新文章并删除旧文件
          await updateArticle(article)
          delArticle(articleNoUpdate.originName)
        }
      } else {
        article.filename = `${article.hashId}-1`
        console.log('文章无变更: ', article.title)
      }
    }
  }
}