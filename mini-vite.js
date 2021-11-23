const Koa = require('koa')
const app = new Koa()
const fs = require('fs')
const path = require('path')

// 返回用户首页
app.use(async ctx => {
    const { url } = ctx.request
    if(url === '/') {
        ctx.type = "text/html"
        const indexPath = path.resolve(__dirname, './index.html')
        ctx.body = fs.readFileSync(indexPath, 'utf8')
    } else if(url.endsWith('.js')) {
        // 响应JS请求
        const jsPath = path.join(__dirname, url) // 转成绝对地址进行加载
        ctx.type = "text/javascript" // 告诉浏览器这是一个JavaScript文件
        const file = rewriteImport(fs.readFileSync(jsPath, 'utf8'))
        ctx.body = file
    } else if(url.startsWith('/@modules/')) {
        // 获取@modules后面的部分，模块名称
        const moduleName = url.replace('/@modules/', '')
        const prefix = path.join(__dirname, './node_modules', moduleName)
        // 要加载文件的地址
        const module = require(prefix + '/package.json').module
        const filePath = path.join(prefix, module)
        const res = fs.readFileSync(filePath, 'utf8')
        ctx.type = "text/javascript" 
        ctx.body = rewriteImport(res)
    }
})

/**
 * 重新导入，变成相对地址
 */
function rewriteImport(content) {
    return content.replace(/ from ['|"](.*)['|"]/g, function(s0, s1) {
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