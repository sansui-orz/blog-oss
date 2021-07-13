const { readdir } = require('fs/promises');
const path = require('path');
const { getFileIfExist } = require('./fsTools');

/**
 * 获取配置
 */
const getConfig = async () => {
  const dir = await readdir(path.resolve('configs'));
  const configFiles = dir.filter(_dir => /^config\.(\w*)\.(js|json)$/.test(_dir));
  const allConfig = {};
  for (let i = 0; i < configFiles.length; i++) {
    const config = await getFileIfExist(path.resolve('configs', configFiles[i]));
    for (let key in config) {
      allConfig[key] = config[key];
    }
  }
  return allConfig;
};

module.exports = getConfig;