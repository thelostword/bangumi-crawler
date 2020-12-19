const timeLineRouter = require('koa-router')(),
    $request = require('../../utils/http').syncBody,
    cheerio = require('cheerio')

function objectToQueryString(obj) {
    return Object.keys(obj).map(key=>{
        return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(obj[key]))
    }).join('&')
}

/**
 * /timeline?type=mono | relation | group | wiki | index | doujin
 */
timeLineRouter.get('/timeline/self', async ctx => {
    let request = ctx.request
    let params = objectToQueryString(request.query)
    let res = await $request({url:`user/${request.query.user_name}/timeline?${params}`,token:request.header.token}).then(res => {
        const $ = cheerio.load(res)
        const dateLine = $('#timeline h4.Header')
        const dateList = $('#timeline ul')
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
                let eps = item.find('span.info').children('a')
                let imgs = item.find('.imgs a')

                let status = item.find('span.info').contents().filter((index, content) => {
                    return content.nodeType === 3
                }).text().trim()

                let score = item.find('div.collectInfo span.starlight').attr('class')

                let innerItem = {
                    user_link: item.find('span.avatar a.avatar').attr('href'),
                    user_avatar: item.find('span.avatar span').attr('style'),
                    user_nickname: '',
                    status: '',
                    status_tip: '',
                    time: item.find('span.info p.date').text().trim(),
                    anime_name: item.find('div.info_sub a.tip').text().trim(),
                    anime_link: item.find('div.info_sub a.tip').attr('href'),
                    info_sub: item.find('div.info_sub').text().trim(),
                    info_link: item.find('div.info_sub a.tip').attr('href'),
                    say: item.find('span.info p.status').text().trim(),
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
        return dataList
    }).catch(err => {
        console.error(err)
        ctx.fail(err.message)
    })
    ctx.success(res)
})

module.exports = timeLineRouter
