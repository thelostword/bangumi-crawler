const timeLineRouter = require('koa-router')(),
    $request = require('../../utils/http').syncBody,
    cheerio = require('cheerio')

function objectToQueryString(obj) {
    return Object.keys(obj).map(key=>{
        if(key!=='user_name' && key!=='self') {
            return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(obj[key]))
        }
    }).join('&')
}
/**
 * /timeline?type=mono | relation | group | wiki | index | doujin
 */
timeLineRouter.get('/timeline', async ctx => {
    let request = ctx.request
    let params = objectToQueryString(request.query)

    let res = await $request({url: request.query.self == 'true' ? `user/${request.query.user_name}/timeline?${params}` : `timeline?${params}`,token:request.header.token}).then(res => {
        const $ = cheerio.load(res)
        const dateLine = $('#timeline h4.Header')
        const dateList = $('#timeline ul')
        let resData = {
            list: [],
            userInfo: {}
        }
        let dataList = []

        // 按日期循环
        for (let i = dateList.length; i--;) {
            let dates = dateLine.eq(i)
            let lis = dateList.eq(i)
            let items = lis.find('li.tml_item')

            let itemData = {
                date: dates.text().trim(),  //日期
                info: []                    //动态列表
            }

            // 循环每日动态
            for (let j = items.length; j--;) {
                let item = items.eq(j)
                let spanNode = request.query.self == 'true' ? 'span.info_full' : 'span.info'
                let eps = item.find(`${spanNode}`).children('a')
                let imgs = item.find('.imgs a')

                let status = item.find(`${spanNode}`).contents().filter((index, content) => {
                    return content.nodeType === 3
                }).text().trim()

                let score = item.find('div.collectInfo span.starlight').attr('class')

                let innerItem = {
                    user_link: item.find('span.avatar a.avatar').attr('href'),
                    user_avatar: item.find('span.avatar span').attr('style'),
                    user_nickname: '',
                    status: '',
                    status_tip: '',
                    time: item.find(`${spanNode} p.date`).text().trim(),
                    anime_name: item.find('div.info_sub a.tip').text().trim(),
                    anime_link: item.find('div.info_sub a.tip').attr('href'),
                    info_sub: item.find('div.info_sub').text().trim(),
                    info_link: item.find('div.info_sub a.tip').attr('href'),
                    say: item.find(`${spanNode} p.status`).text().trim(),
                    img: '',
                    eps: [],
                    imgs: [],
                    collect_info: item.find('div.collectInfo').text().trim(),
                    score: ''
                }
                if(!!score) {
                  innerItem.score = score.match(/\d+$/)[0]
                }
                if(!!status) {
                    innerItem.status = status.match(/^\S+/)[0]
                }
                if(/\s+.+$/.test(status)) {
                    innerItem.status_tip = status.match(/\s+.+$/)[0].replace(/^[\s|、]*/,'')
                }

                // 循环条目列表
                for(let k = 0; k < eps.length; k++) {
                    let eps_item = eps.eq(k)
                    if(k === 0 && eps_item.find('img').length >= 1) {
                        innerItem.img = eps_item.find('img').attr('data-cfsrc') || eps_item.find('img').attr('src')
                        continue
                    }
                    if(!innerItem.user_nickname && eps_item.attr('href').includes('user')) {
                        innerItem.user_nickname = eps_item.text().trim()
                        continue
                    }
                    let epsItem = {
                        link: eps_item.attr('href'),
                        name: eps_item.text().trim()
                    }
                    innerItem.eps.push(epsItem)
                }

                // 循环图片
                for(let k = imgs.length; k--;) {
                    let imgs_item = imgs.eq(k)
                    let imgsItem = {
                        link: imgs_item.attr('href'),
                        url: imgs_item.find('img').attr('data-cfsrc') || imgs_item.find('img').attr('src')
                    }
                    innerItem.imgs.unshift(imgsItem)
                }

                itemData.info.unshift(innerItem)
            }
            dataList.unshift(itemData)
        }
        resData.list = dataList
        if(request.header.token) {
            const userNode = $('div.idBadgerNeue')
            resData.userInfo.user_name = userNode.children('a').attr('href')
            resData.userInfo.user_avatar = userNode.children('a').children('span').attr('style')
        }
        return resData
    }).catch(err => {
        ctx.fail(err.message)
    })
    ctx.success(res)
})

module.exports = timeLineRouter
