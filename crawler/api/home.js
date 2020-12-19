const homeRouter = require('koa-router')(),
    $request = require('../../utils/http').syncBody,
    cheerio = require('cheerio')

/**
 * 首页数据
 */
homeRouter.get('/', async ctx => {
    let res = await $request().then(res => {
        const $ = cheerio.load(res)
        const lis = $('#featuredItems li')
        let dataList = []
        for (let i = lis.length; i--;) {
            let li = lis.eq(i)
            let items = li.find('.mainItem')
            
            let itemData = {
                name: li.find('h2').text().trim(),
                link: li.find('h2 a').attr('href').trim(),
                item: []
            }
            
            for (let j = items.length; j--;) {
                let item = items.eq(j)
                itemData.item.unshift({
                    name: item.find('a p.title').text(),
                    cover: item.find('a div.image').attr('style').trim(),
                    link: item.find('a').attr('href').trim(),
                    watch: item.find('p.info').text().trim()
                })
            }
            dataList.unshift(itemData)
        }
        return dataList
    }).catch(err => {
        ctx.fail(err.message)
    })
    ctx.success(res)
})

module.exports = homeRouter