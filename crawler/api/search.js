const searchRouter = require('koa-router')(),
    $request = require('../../utils/http').syncBody,
    cheerio = require('cheerio')

/**
 * /search
 */
searchRouter.get('/search', async ctx => {

    let token = ctx.request.header.token
    let params = ctx.request.query

    let res = await $request({url: `subject_search/${params.val}?cat=${params.type}&page=${params.page}`, token}).then(res => {
        const $ = cheerio.load(res)
        const lis = $('#browserItemList li.item')
        let dataList = []
        for (let i = lis.length; i--;) {
            let li = lis.eq(i)
            let itemData = {
                id: li.children('a.cover').attr('href'),                                                //连接地址
                cover: li.children('a.cover').find('img.cover').attr('src'),                            //封面图
                name_cn: li.find('h3 a').text().trim(),                                                 //中文名
                name: li.find('h3 small').text().trim(),                                                //名称
                sub_info: li.find('p.info').text().trim(),                                              //详情
                rate: li.find('p.rateInfo span.tip_j').text().trim(),                                   //评分人数
                score: li.find('p.rateInfo span.starstop-s').children('span').attr('class'),            //评分
                score_text: li.find('p.rateInfo span.starstop-s').children('span').attr('class'),       //评分文本
                rank: li.find('span.rank').contents().filter((index, content) => {
                    return content.nodeType === 3
                }).text().trim()                                                                        //评论
            }
            if(!!itemData.score) {
                itemData.score = itemData.score.match(/\d+$/)[0]
            }
            dataList.unshift(itemData)
        }
        return dataList

    }).catch(err => {
        ctx.fail(err.message)
    })
    ctx.success(res)
})

module.exports = searchRouter
