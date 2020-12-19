/**
 * 路由统一出口
 */
const router =  require('koa-router')(),
    homeRouter = require('./api/home'),
    animeRankRouter = require('./api/anime.rank'),
    timeLineRouter = require('./api/timeline'),
    rakuenRouter = require('./api/rakuen'),
    rakuenRouterTopic = require('./api/rakuen.topic.group'),
    loginRouter = require('./api/login'),
    captchaRouter = require('./api/captcha'),
    collectionRouter = require('./api/collection'),
    updateRouter = require('./api/update')

router
.use(homeRouter.routes()) //首页
.use(timeLineRouter.routes()) //时间轴
.use(rakuenRouter.routes()) //超展开
.use(rakuenRouterTopic.routes()) //超展开话题详情
.use(animeRankRouter.routes()) //动漫排行榜
.use(loginRouter.routes()) //登录
.use(captchaRouter.routes()) // 验证码
.use(collectionRouter.routes()) // 收藏
.use(updateRouter.routes()) //自动更新


module.exports = router
