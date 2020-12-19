const collectionRouter = require('koa-router')(),
    $request = require('../../utils/http').syncBody,
    cheerio = require('cheerio')

/**
 * /collection?type=mono | relation | group | wiki | index | doujin
 */
collectionRouter.get('/collection', async ctx => {

    let token = ctx.request.header.token
    let params = ctx.request.query

    let res = await $request({url: `${params.type}/list/${params.name}/${params.event}?page=${params.page}`, token}).then(res => {
        const $ = cheerio.load(res)
        const lis = $('#browserItemList li.item')
        let dataList = []
        for (let i = lis.length; i--;) {
            let li = lis.eq(i)
            let itemData = {
                id: li.children('a.cover').attr('href'),                                         //连接地址
                cover: li.children('a.cover').find('img.cover').attr('src'),                     //封面图
                name_cn: li.find('h3 a').text().trim(),                                          //中文名
                name: li.find('h3 small').text().trim(),                                         //名称
                sub_info: li.find('p.info').text().trim(),                                       //详情
                date: li.find('p.collectInfo span.tip_j').text().trim(),                         //收藏时间
                tag: li.find('p.collectInfo span.tip').text().trim(),                            //标签
                score: li.find('p.collectInfo span.starstop-s').children('span').attr('class'),  //评分
                comment: li.find('div.text_main_even').text().trim()                             //评论
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

module.exports = collectionRouter
