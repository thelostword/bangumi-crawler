const rakuenRouter = require('koa-router')(),
    $request = require('../../utils/http').syncBody,
    cheerio = require('cheerio')

/**
 * 超展开话题列表
 * 请求地址/rakuen/topiclist?type= group | subject | ep | mono
 */
rakuenRouter.get('/rakuen/topiclist', async ctx => {
    let request = ctx.request
    let res = await $request({url:request.url,token:request.header.token}).then(res => {
        const $ = cheerio.load(res)
        const lis = $('#eden_tpc_list li')
        let dataList = []
        for (let i = lis.length; i--;) {
            let li = lis.eq(i)

            let itemData = {
                info_url: li.children('a').attr('href'),                          //文章详情
                avatar: li.children('a').find('span').attr('style'),              //头像
                title: li.find('div.inner a.title').text().trim(),                //标题
                sub_url: li.find('div.inner span.row').find('a').attr('href'),    //讨论详情
                reply: li.find('div.inner small.grey').text().trim(),             //回复数
                from: li.find('div.inner span.row').find('a').text().trim(),      //小组/人物
                time: li.find('div.inner span.row').find('small').text().trim()   //时间
            }
            dataList.unshift(itemData)
        }
        return dataList
    }).catch(err => {
        ctx.fail(err.message)
    })
    ctx.success(res)
})

module.exports = rakuenRouter
