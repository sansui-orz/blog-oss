// @ts-check

const OSS = require('ali-oss');
let client = null;
/**
 * 创建OSS实例
 * @param {string} region 填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou
 * @param {*} accessKeyId 阿里云账号AccessKey拥有所有API的访问权限，风险很高
 * @param {*} accessKeySecret
 * @param {*} bucket Bucket名称
 */
exports.createOssClient = (region, accessKeyId, accessKeySecret, bucket) => {
  client = new OSS({
    region,
    accessKeyId,
    accessKeySecret,
    bucket
  });
  return client;
};

/**
 * 判断文件在oss上是否存在
 * @param {string} name 文件名
 * @param {*} options 可选项：https://help.aliyun.com/document_detail/111392.html?spm=a2c4g.11186623.6.1109.52e6752cBafyk4
 * @returns {Promise<boolean>}
 */
exports.isExistObject = async (name, options = {}) => {
  try {
    const res = await client.head(name, options);
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      return false;
    }
  }
  return true;
};

/**
 * 上传文件到oss
 * @param {string} fileName
 * @param {string | Buffer} data
 */
exports.pushObject = async (fileName, data) => {
  await client.put(fileName, Buffer.isBuffer(data) ? data : Buffer.from(data));
};

/**
 * 获取所有图片
 */
exports.getImgList = async () => {
  const result = await client.list({
    prefix: 'images/'
  });
  return result;
}