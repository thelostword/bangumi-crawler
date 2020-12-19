const captchaRouter = require('koa-router')()
const axios = require('axios')
const cheerio = require('cheerio')

captchaRouter.get('/captcha', async ctx => {

  let cookies = {}

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
    let loginRsp = await axios.get('https://bgm.tv/login')
    upadteCookie(loginRsp)
    let formhash = cheerio.load(loginRsp.data)('input[name=formhash]').attr('value')
    let captchaRsp = await axios({
      method: 'get',
      url: 'https://bgm.tv/signup/captcha',
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
        cookie: getCookie()
      }
    })
    let resData = {
        captcha: captchaRsp.data,
        cookie: getCookie(),
        formhash
    }

    ctx.success(resData)
  } catch(err) {
    ctx.fail(err.message || err)
  }

})

module.exports = captchaRouter
