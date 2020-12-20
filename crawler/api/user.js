const userRouter = require('koa-router')(),
    $request = require('../../utils/http').syncBody,
    cheerio = require('cheerio')

/**
 * /user 用户信息
 */
userRouter.get('/user', async ctx => {

    let token = ctx.request.header.token

    let res = await $request({url: 'settings', token}).then(res => {
        const $ = cheerio.load(res)
        const content = $('#columnA table.settings')

        let userInfo = {
            nick_name: content.find('input[name=nickname]').attr('value'),                     //昵称
            name: content.find('tr').eq(3).children('td').eq(1).text(),                        //用户名
            avatar: content.find('tr').eq(2).find('img.port').eq(0).attr('src'),               //头像
            sign: content.find('input[name=sign_input]').attr('value')                         //签名
        }
        if(!userInfo.name) {
            userInfo.name = userInfo.nick_name
        }
        return userInfo
    }).catch(err => {
        ctx.fail(err.message)
    })
    ctx.success(res)
})

module.exports = userRouter
