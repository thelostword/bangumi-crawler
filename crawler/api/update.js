const updateRouter = require('koa-router')()

/**
 * 版本更新接口
 */
const result = {
  versionCode: '3',
  url: '1',
  note: '修复了一个bug'
}
updateRouter.get('/update', async ctx => {
  let params = ctx.request.query
  if (params.length < 1) {
    ctx.fail('缺少参数')
    return
  }
  let data = {}
  if (params.versionCode === result.versionCode) {
    // 没有更新
    data = {
      update: false,
      url: '',
      note: ''
    }
  } else {
    data = {
      update: true,
      url: result.url,
      note: result.note
    }
  }
  ctx.success(data)
})

module.exports = updateRouter
