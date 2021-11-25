const Koa = require('koa')
const app = new Koa()
const fs = require('fs')
const path = require('path')
const compilerSfc = require('@vue/compiler-sfc')
const compilerDom = require('@vue/compiler-dom')

// 返回用户首页
app.use(async ctx => {
    const { url, query } = ctx.request
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
    } else if(url.indexOf('.vue') > -1) {
        // 读取vue文件内容
        const vuePath = path.join(__dirname, url.split('?')[0])
        // compilerSfc解析SFC，得到一个ast
        const res = compilerSfc.parse(fs.readFileSync(vuePath, 'utf8'))
        console.log('ast', res,  res.descriptor.styles)
        // 没有query.type，则说明是sfc请求
        if(!query.type) {
            // 处理内部script

            // 获取脚本内容
            const scriptConent = res.descriptor.script.content
            // 转换默认导出配置对象为变量
            const script = scriptConent.replace('export default ', 'const __script = ')
            // 获取styles内容
            const styles = res.descriptor.styles
            let importCss = ''
            if(styles.length > 0) {
                styles.forEach((o, i)=> {
                    importCss += `import '${url}?type=style&index=${i}&lang=${o.lang}'\n`
                })
            }
            ctx.type = 'text/javascript'
            ctx.body = `
                ${rewriteImport(script)}
                // template 解析转换为另一个请求单独处理
                import { render as __render } from '${url}?type=template'
                ${importCss}
                __script.render = __render
                export default __script
            `
        } else if(query.type === 'template') {
            const tpl = res.descriptor.template.content
            // 编译为包含render模块的文件
            const render = compilerDom.compile(tpl, { mode: 'module' }).code
            ctx.type = 'text/javascript'
            ctx.body = rewriteImport(render)
        } else if(query.type === 'style') {
            // 获取styles内容
            const styles = res.descriptor.styles
            const index = query.index
            const lang = query.lang // 可以根据lang是less还是scss，然后用相应的处理器进行处理
            const content = `
            const css = "${styles[index].content.replace(/[\n\r]/g, "")}"
            let link = document.createElement('style')
            link.setAttribute('type', 'text/css')
            document.head.appendChild(link)
            link.innerHTML = css
            export default css
            `
            ctx.type = 'application/javascript'
            ctx.body = content
        }
        
    } else if(url.endsWith('.jpg')) {
        ctx.body = fs.readFileSync('src' + url)
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
    console.log("mini vite start at 9527 ~")
})