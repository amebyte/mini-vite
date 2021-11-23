# mini-vite

初始化一个新项目

```
npm init -y
```

安装Koa

```
yarn add koa
```

在根目录建一个mini-vite.js文件构建一个koa服务器

```javascript
const Koa = require('koa')
const app = new Koa()
const fs = require('fs')

// 返回用户首页
app.use(async ctx => {
    ctx.body = 'mini vite ~'
})

app.listen(9527, () => {
    console.log("mini vite start ~")
})
```

我们要读取index.html文件返回给用户首页需要用到fs模块

```javascript
const fs = require('fs')
```

拿到用户当前请求的URL，判断如果是首页就读取index.html内容返回给前端

```javascript
const { url } = ctx.request
if(url === '/') {
    ctx.type = "text/html"
    ctx.body = fs.readFileSync('./index.html', 'utf8')
}
```
这个时候我们发现前端向后端发送了一个main.js文件的请求

 ![](./md/01.png)

所以后端要响应这个请求

```javascript
if(url === '/') {
    // ...
} else if(url.endsWith('.js')) {
    // 响应JS请求
    const jsPath = path.join(__dirname, url) // 转成绝对地址进行加载
    ctx.type = "text/javascript" // 告诉浏览器这是一个JavaScript文件
    ctx.body = fs.readFileSync(jsPath, 'utf8')
}
```

