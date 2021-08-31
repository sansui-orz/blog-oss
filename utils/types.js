// @ts-check

/**
 * @typedef {Array<{
 *   title: string;
 *   level: number;
 *   id: string;
 * }>} ArticleMenu
 */

/**
 * @typedef ArticleInfo
 * @property {string} title 文章标题
 * @property {string} id
 * @property {string} year
 * @property {string} month
 * @property {string} day
 * @property {string[]} tags
 * @property {ArticleMenu} menu 目录
 * @property {string} filepath
 * @property {string} contentHash
 * @property {string} filename 文件名: 拼接规则为 {titleId}-{contentHash}-{issuesInited}
 */

/**
 * @typedef {Array<{
 *   year: string;
 *   subList: ArticleInfo[];
 * }>} IndexMenu
 */

module.exports = {};