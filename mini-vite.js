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
        ctx.body = rewriteImport(fs.readFileSync(jsPath, 'utf8'))
    }
})

/**
 * 重新导入，变成相对地址
 */
function rewriteImport(content) {
    content.replace(/ from ['"](.*)['"]/g, function(s0, s1) {
        // s0匹配字符串，s1分组内容
        // 看看是不是相对地址
        if(s1.startsWith('.') || s1.startsWith('/') || s1.startsWith('../')) {
            // 原封不动返回
            return s0
        } else {
            return ` from '/@modules/${s1}'`
        }
    })
}

app.listen(9527, () => {
    console.log("mini vite start ~")
})