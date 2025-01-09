// 将本地的静态页面（HTML文件）直接上传
const { createDirIfNotExit } = require('./fsTools');
const path = require('path');
const { readdir, readFile } = require('fs/promises');
const { pushObject } = require('./oss');


module.exports = async function uploadStaticPages() {
    await createDirIfNotExit(path.resolve('static'))
    const staticFiles = await readdir(path.resolve('static'));
    // 将所有的静态文件全部上传上去
    if (staticFiles && staticFiles.length > 0) {
        for (let i = 0; i < staticFiles.length; i ++) {
            console.log('上传静态页面: ', staticFiles[i])
            const file = await readFile(path.resolve(`static/${staticFiles[i]}`))
            await pushObject(staticFiles[i], file, {
                'Cache-Control': 'no-cache'
              });
        }
    }
}