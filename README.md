# blog-oss

一个快速简单的将github上的markdown博客部署到阿里云OSS的命令工具。

## 快速上手

### 安装

```sh
$ npm install blog-oss -g
```

### 准备资源

1. 阿里云OSS(需绑定已备案的域名)
3. github上开通存放博客的仓库（需要生成access token，用来动态生成对应文章的issues）

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

...待完善

## 功能规划

#### 待完善的功能有:

- [] 支持打包输出到本地
- [] 打通Gitalk评论
- [] 打包流程hooks
- [] 支持一剑发布到google drive
- [] 支持一键发布到github gist
- [] 支持博文访问打点（寻找免费服务）

#### 已支持功能

- ✅ markdown转html
- ✅ 一键发布到阿里云OSS
- ✅ 自定义页面模版文件

