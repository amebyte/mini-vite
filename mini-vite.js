const Koa = require('koa')
const app = new Koa()

// 返回用户首页
app.use(async ctx => {
    ctx.body = 'mini vite ~'
})

app.listen(9527, () => {
    console.log("mini vite start ~")
})