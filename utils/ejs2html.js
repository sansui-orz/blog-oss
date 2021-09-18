const ejs = require('ejs');

/**
 * 将Markdown文件渲染成html文件
 * @param {string} templatePath 模板文件地址
 * @param {Object} renderConfig 渲染配置
 * @returns 
 */
module.exports = async function(templatePath, renderConfig) {
    return await new Promise((resolve, reject) => ejs.renderFile(
        templatePath,
        renderConfig,
        // { async: true },
        function(err, str){
            if (err) {
                return reject(err);
            }
            // str => 输出渲染后的 HTML 字符串
            resolve(str);
        })
    );
}