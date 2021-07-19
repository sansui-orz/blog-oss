# blog-oss

一个快速简单的将github上的markdown博客部署到阿里云OSS的命令工具。

## 快速上手

### 安装

```sh
$ npm install blog-oss -g
```

### 准备资源

1. 阿里云OSS(需绑定已备案的域名)
3. github上开通存放博客的仓库（需要[生成access token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token)，用来动态生成对应文章的issues）

### 初始化博客

```sh
$ blog-oss your-project-name
```

### 一键部署到阿里云OSS

```sh
$ blog-oss deploy
```

#### 自动化部署 [开发中]

```sh
$ npm run publish
```

基于Github Actions自动化部署，这块需要将敏感信息提取到Github Actions secrets中。

### 构建到本地 [开发中]

```sh
$ blog-oss build
```

## 详细配置

最终在项目中的configs文件夹下的所有config都将呗合并为一个config对象，例如:

```js
// config.default.js中
exports.a = {
  a: 'aaa',
};
```

```js
// config.private.js中
exports.b = 'bbb';

exports.a = {
  c: 'ccc',
}
```

由于配置参数的合并使用的是[lodash.merge](https://www.lodashjs.com/docs/lodash.merge)，所以深度对象属性也会进行合并操作，最终传递到模版文件中的config对象则是两个config文件的合集:

```json
{
  "a": {
    "a": "aaa",
    "c": "ccc"
  },
  "b": "bbb"
}
```

需要注意的是敏感信息（github token / oss accessKeySecret等）请保存在`config.private.js`内，该文件默认已被`.gitignore`包含。

- 默认需要的配置内容已经包含在初始化模版的configs文件夹下，将其补充完整即可一键打包上传至阿里云OSS。

### 自定义博客页面

该工具默认提供一款基础模版，如果需要自定义页面，则可以在配置文件中增加`templates`配置，配置方法如下:

```js
// config.[name].js
exports.templates = {
  article: 'templates/article.ejs',
  index: 'templates/index.ejs'
};
```

需要注意的是，这里的模版文件路径为相对于博客项目的跟目录地址。并且目前仅支持`ejs`的模版.

- 在index页面中，将会注入如下数据:

```typescript
interface props {
  config: any;
  list: Array<{
    year: string;
    subList: Array<{
      title: string;
      id: string;
      year: string;
      month: string;
      day: string;
      tags: string[];
      menu: Array<{
        title: string;
        level: number;
        id: string;
      }>
      filepath: string;
    }>;
  }>;
}
```

- 在article页面中，将会注入如下数据:

```typescript
interface props {
  title: string;
  id: string;
  year: string;
  month: string;
  day: string;
  tags: string[];
  menu: Array<{
    title: string;
    level: number;
    id: string;
  }>
  filepath: string;
  body: HtmlString,
  config: any;
}
```

- 文章会被上传到oss储存桶中的`article`目录，所以如果需要访问文章，需要这样访问`https://[yourOssBucketName].[yourOssRegion].aliyuncs.com/article/[yourArticleId]`

## 功能规划

#### 待完善的功能有:

- [] 支持打包输出到本地
- [] 打通Gitalk评论
- [] 打包流程hooks
- [] 支持一剑发布到google drive
- [] 支持一键发布到github gist
- [] 支持博文访问打点（寻找免费服务）
- [] 允许指定存放在oss bucket上的特定文件夹下

#### 已支持功能

- ✅ markdown转html
- ✅ 一键发布到阿里云OSS
- ✅ 自定义页面模版文件
- ✅ Github Actions自动化部署

