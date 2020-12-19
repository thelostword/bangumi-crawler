const animeRankRouter = require('koa-router')(),
    $request = require('../../utils/http').syncBody,
    cheerio = require('cheerio')

/**
 * 动漫排行榜
 * /anime/browser?sort=rank | date | title
 * /anime/browser/airtime/2020
 * /anime/browser/tv | web | ova | movie | misc
 * /anime/browser/?orderby=d
 */
animeRankRouter.get(['/anime/browser/:aid', /\/anime\/browser\/.*/], async ctx => {
    let rqUrl = ctx.request.url
    let res = await $request({url:rqUrl}).then(res => {
        const $ = cheerio.load(res)
        const lis = $('#browserItemList li')
        let dataList = []
        for (let i = lis.length; i--;) {
            let li = lis.eq(i)
            
            let itemData = {
                name: li.find('h3 a').text().trim(),                    //名称
                name_cn: li.find('h3 small').text().trim(),             //中文名
                link: li.find('a.subjectCover').attr('href'),            //url地址
                cover: li.find('img.cover').attr('src'),                //封面
                info: li.find('.inner p.info').text().trim(),           //详情
                rate: li.find('.inner small.fade').text().trim(),       //评分
                rate_tip: li.find('.inner span.tip_j').text().trim()    //评分说明
            }
            dataList.unshift(itemData)
        }
        return dataList
    }).catch(err => {
        ctx.fail(err.message)
    })
    ctx.success(res)
})

module.exports = animeRankRouter