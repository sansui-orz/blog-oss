const { readdir } = require('fs/promises');
const path = require('path');
const { getFileIfExist } = require('./fsTools');
const { merge } = require('lodash');

let config

/**
 * 获取配置
 */
const getConfig = async () => {
  if (!config) {
    const dir = await readdir(path.resolve('configs'));
    const configFiles = dir.filter(_dir => /^config\.(\w*)\.(js|json)$/.test(_dir));
    const allConfig = [];
    for (let i = 0; i < configFiles.length; i++) {
      const config = await getFileIfExist(path.resolve('configs', configFiles[i]));
      allConfig.push(config);
    }
    config = merge(...allConfig);
  }
  return config
};

module.exports = getConfig;