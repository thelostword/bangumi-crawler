const loginRouter = require('koa-router')()
const axios = require('axios')
const qs = require('qs')

loginRouter.post('/login', async ctx => {
  const data = ctx.request.body


  let cookies = {}
  let token = ''

  function getCookie() {
    return Object.keys(cookies).map(key => `${key}=${cookies[key]};`).join(' ')
  }

  function upadteCookie(rsp) {
    for (setCookie of rsp.headers['set-cookie']) {
      let [key, ...val] = setCookie.split(';')[0].split('=')
      cookies[key] = val.join('=')
    }
  }
  try {
    let followRsp = await axios({
      method: 'post',
      url: 'https://bgm.tv/FollowTheRabbit',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        cookie: data.cookie
      },
      data: qs.stringify({
        formhash: data.formhash,
        referer: '',
        dreferer: '',
        email: data.email,
        password: data.password,
        captcha_challenge_field: data.captcha,
        loginsubmit: '登录'
      })
    })
    upadteCookie(followRsp)
    token = getCookie()
    console.log(`cookie=${getCookie()}`)
    ctx.success(token)
  } catch(err) {
    ctx.fail(err.message || err)
  }
})

module.exports = loginRouter
