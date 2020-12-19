/*
 * @Description: auth demo for bgm.tv
 * @Author: ekibun
 * @Date: 2019-06-30 16:42:16
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-08 01:41:10
 */
const axios = require('axios')
const cheerio = require('cheerio')
const qs = require('qs')
const terminalImage = require('terminal-image')

// config
const email = '***'
const password = '***'
const client_id = 'bgm***'
const client_secret = '***'

const readlinePromise = require('readline-promise').default
const readline = readlinePromise.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
})

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

(async () => {
    let loginRsp = await axios.get('https://bgm.tv/login')
    upadteCookie(loginRsp)
    let formhash = cheerio.load(loginRsp.data)('input[name=formhash]').attr('value')
    console.log(`formhash=${formhash}`)
    let captchaRsp = await axios({
        method: 'get',
        url: 'https://bgm.tv/signup/captcha',
        responseType: 'arraybuffer',
        headers: {
            cookie: getCookie()
        }
    })
    console.log(await terminalImage.buffer(captchaRsp.data))
    let captcha = await readline.questionAsync('captcha?')
    let followRsp = await axios({
        method: 'post',
        url: 'https://bgm.tv/FollowTheRabbit',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            cookie: getCookie()
        },
        data: qs.stringify({
            formhash,
            referer: '',
            dreferer: '',
            email,
            password,
            captcha_challenge_field: captcha,
            loginsubmit: '登录'
        })
    })
    upadteCookie(followRsp)
    console.log(`cookie=${getCookie()}`)

    let oauthRsp = await axios({
        method: 'get',
        url: `https://bgm.tv/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=code`,
        headers: {
            cookie: getCookie()
        }
    })
    formhash = cheerio.load(oauthRsp.data)('input[name=formhash]').attr('value')
    console.log(`formhash=${formhash}`)

    oauthRsp = await axios({
        method: 'post',
        maxRedirects: 0,
        validateStatus: null,
        url: `https://bgm.tv/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=code`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            cookie: getCookie()
        },
        data: qs.stringify({
            formhash,
            redirect_uri: '',
            client_id,
            submit: '授权'
        })
    })
    let code = oauthRsp.headers.location.split('=').slice(1).join('=')
    console.log(`code=${code}`)

    let tokenRsp = await axios({
        method: 'post',
        maxRedirects: 0,
        validateStatus: null,
        url: 'https://bgm.tv/oauth/access_token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify({
            grant_type: 'authorization_code',
            client_id,
            client_secret,
            code,
            redirect_uri: 'code',
            state: ''
        })
    })
    console.log(tokenRsp.data)
})().catch(e => {
    console.log(e.stack || e)
}).then(() => {
    readline.close()
})
