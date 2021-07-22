// @ts-check

const { access, writeFile, mkdir } = require('fs/promises');
const { constants, readFileSync, fstat } = require('fs');
const path = require('path');
const { writeFileFail } = require('./errorLog');

/**
 * 如果文件存在，就获取文件，否则返回null
 * @param {string} filePath
 * @returns {Promise<any>}
 */
exports.getFileIfExist = async (filePath) => {
  try {
    await access(filePath, constants.R_OK);
    const extname = path.extname(filePath);
    if (extname == '.json' || extname == '.js') {
      return require(filePath);
    } else {
      return readFileSync(filePath);
    }
  } catch {
    return null;
  }
};

/**
 * 创建文件，兼容新建文件夹
 * @param {string} filePath
 * @param {string} data
 */
exports.createFile = async (filePath, data) => {
  try {
    const basePath = path.dirname(filePath);
    try {
      await access(basePath, constants.W_OK);
    } catch {
      await mkdir(basePath);
    }
    await writeFile(filePath, data);
  } catch (error) {
    writeFileFail(error);
  }
};

/**
 * 如果没有这个文件夹，就创建它
 * @param {string} filepath
 */
exports.createDirIfNotExit = async (filepath) => {
  try {
    await access(filepath, constants.R_OK);
  } catch {
    await mkdir(filepath);
  }
}