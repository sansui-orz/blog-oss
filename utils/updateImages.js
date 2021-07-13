const { readdir, readFile } = require('fs/promises');
const { getImgList, pushObject } = require('./oss');
const path = require('path');
const chalk = require('chalk');

module.exports = async function updateImages() {
  const onlineImages = (await getImgList()).objects;
  const localImages = await readdir(path.resolve('images'));
  for (let i = 0; i < localImages.length; i++) {
    let mark = false;
    for (let j = 0; j < onlineImages.length; j++) {
      if (localImages[i] === onlineImages[j].name.split('/')[1]) {
        mark = true;
        break;
      }
    }
    if (!mark) {
      await pushObject(`images/${localImages[i]}`, await readFile(path.resolve(`images/${localImages[i]}`)));
      console.log(chalk.green(`上传图片: images/${localImages[i]}`));
    }
  }
}