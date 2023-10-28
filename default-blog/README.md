# 实例的博客

- [第一篇博文](./articles/第一篇博文.md)

## 配置

首先，需要完善configs目录下的内容。

其中`config.default.js`储存的是可以被公开的信息，如网站的标题，备案号等。

在`config.private.js`中存储隐私信息，如阿里云OSS的`accessKeyId`与`accessKeySecret`，以及github的`personalAccessToken`。目前只基于这两个服务。

## 创建新文章

首先，在articles目录下新建一个markdown文件。文章头部定义文章标题、标签以及创建时间（将在后面的HTML文档中展示）。

```md
# 文章标题

[tag]:标签1|标签2|标签3
[create]:2020-01-01

这里开始文章正文

![图片的引用请以相对路径引用](../images/xxx.png)
```

编写完文章后，请在根目录的`README.md`文件中增加该文件的引用，只有在`README.md`中指明引用的文章才会被打包, 如下。

```md
# blog

个人博客

- [文章1](./articles/文章1.md)
- [文章2](./articles/文章2.md)
```

最终会根据`README.md`中的文章引用生成博客首页，并根据文章内的创建时间标签自动排序，并以年为维度进行分组。

## 打包流程

首先，部署运行`npm run deploy`，其会调用[blog-oss](https://github.com/sansui-orz/blog-oss)实现一键打包上传至阿里云oss上。

需要构建到本地则可以使用`npm run build`, 会将文章转成html并输出到当前目录的dist文件夹（默认）。

## END

这是一个非常简单且轻量级的Blog工具，如果真的有使用者，或者使用者有任何疑问，可以联系我: maosheng_orz@icloud.com
