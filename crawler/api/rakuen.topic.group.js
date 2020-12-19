const rakuenTopicGroup = require('koa-router')(),
    $request = require('../../utils/http').syncBody,
    cheerio = require('cheerio'),
    fs = require('fs')

/**
 * 超展开 ->> 小组话题详情
 * /rakuen/topic/group
 */
rakuenTopicGroup.get('/rakuen/topic/group/:aid', async ctx => {
    let rqUrl = ctx.request.url
    let res = await $request({url:rqUrl}).then(res => {
        fs.writeFileSync('./static/anime.rank.html',res,{ flag: 'a+' },err => {})
        const $ = cheerio.load(res)
        let data = {}

        const groupInfo = $('#pageHeader')
        data.group_info = {
          avatar: groupInfo
        }

        const lis = $('#eden_tpc_list li')
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
            data.dataList.unshift(itemData)
        }
        // return dataList
    }).catch(err => {
        ctx.fail(err.message)
    })
    ctx.success(res)
})

module.exports = rakuenTopicGroup