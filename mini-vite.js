const Koa = require('koa')
const app = new Koa()
const fs = require('fs')
const path = require('path')

// 返回用户首页
app.use(async ctx => {
    const { url } = ctx.request
    if(url === '/') {
        ctx.type = "text/html"
        ctx.body = fs.readFileSync('./index.html', 'utf8')
    } else if(url.endsWith('.js')) {
        // 响应JS请求
        const jsPath = path.join(__dirname, url) // 转成绝对地址进行加载
        ctx.type = "text/javascript" // 告诉浏览器这是一个JavaScript文件
        ctx.body = fs.readFileSync(jsPath, 'utf8')
    }
})

app.listen(9527, () => {
    console.log("mini vite start ~")
})