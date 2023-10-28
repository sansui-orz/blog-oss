# blog-oss

一个快速简单的将github上的markdown博客部署到阿里云OSS的命令工具。

## 快速上手

### 安装

```sh
$ npm install blog-oss -g
```

### 准备资源

1. 阿里云OSS(最好绑定已备案的域名)
3. github上开通存放博客的仓库（需要[生成access token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token)，用来动态生成对应文章的issues）

### 初始化博客

```sh
$ blog-oss your-project-name
```

该命令将在当前文件夹初始化一个简单的仓库模版。请参照其中的`README.md`进行资源配置。

### 一键部署到阿里云OSS

```sh
$ blog-oss deploy
```

该命令将自动将本地markdown的文章内容转成HTML并发布到OSS上。

### 构建到本地

```sh
$ blog-oss build
```

该命令会将本地Markdown文章转成HTML, 并保存到当前文件夹下（默认dist文件夹）。

## 详细配置

最终在项目中的configs文件夹下的所有config都将被合并为一个config对象，例如:

```js
// config.default.js中
module.exports = {
  // 博客基础信息
  name: '博客的名称',
  slogen: '博客的口号',
  favicon: '博客的favicon',
  ICPCode: '备案号，没有则不显示备案号',
  githubAddress: 'github地址，没有则不显示github地址',
  github: { // github相关配置，用以创建评论。依赖gitalk: https://gitalk.github.io/
    clientID: '',
    clientSecret: '',
    repo: '',
    owner: '',
    admin: [''],
  },
  oss: { // 阿里云相关配置信息
    region: '',
    bucketName: ''
  }
};
```

```js
// config.private.js中，该文件请不要提交到github
exports.oss = { // 阿里云OSS敏感信息
  accessKeyId: '',
  accessKeySecret: ''
}

exports.github = { // github敏感信息
  personalAccessToken: ''
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

- 在`index.ejs`页面中，将会注入如下数据:

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

- 在`article.ejs`页面中，将会注入如下数据:

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
  html: string;
}
```

- 文章会被上传到oss储存桶中的`article`目录，所以如果需要访问文章，需要这样访问`https://[yourOssBucketName].[yourOssRegion].aliyuncs.com/article/[yourArticleId].html`

具体体验如何，可以访问我的个人博客，它就是使用这个库进行发布的: [前端于我](https://limaosheng.top/)

## 功能规划

#### 待完善的功能有:

- [] 打包流程hooks
- [] 支持一键发布到google drive
- [] 支持一键发布到github gist
- [] 支持博文访问打点（寻找免费服务）
- [] 允许指定存放在oss bucket上的特定文件夹下
- [] 允许插入静态页面

#### 已支持功能

- ✅ 支持打包输出到本地
- ✅ markdown转html
- ✅ 一键发布到阿里云OSS
- ✅ 自定义页面模版文件
- ✅ Github Actions自动化部署
- ✅ 打通Gitalk评论

我对于目前的功能感觉是完全够用的， 所以暂无支持新功能的想法。如果实际有其他人使用，并有痛点，我应该才会进行迭代。

有问题可以邮箱联系我: maosheng_orz@icloud.com

