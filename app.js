const Koa = require('koa'),
    app = new Koa(),
    router = require('./crawler/index'),
    routerRes = require('./utils/routerRes'),
    bodyparser = require('koa-bodyparser')

const config = require('./config')




app
.use(bodyparser())
.use(routerRes())
.use(router.routes())

app.listen(config.port, () => {
    console.log(`服务已启动,http://localhost:${config.port}`)
})
