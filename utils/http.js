const request = require('request'),
    config = require('../config')

/**
 * @param {*} options
 */
function $request(options) {
    let op = Object.assign(
        {},{
            url: '',
        },
        options
    )
    return new Promise((resolve,reject) => {
        request({
            url: config.url + op.url,
            method: op.method || 'GET',
            // headers: {
            //     'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
            //     'Referer':'',

            // },
            headers: {
                Cookie: op.token,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
            }
        }, (err, response, body) => {
            if(err){
                reject(err)
            }
            if(response && response.statusCode === 200) {
                resolve(body)
            }else {
                reject('请求失败')
            }
        })
    })
}

let syncBody = async function (options) {
    let body = await $request(options)
    return body
}

module.exports = {
    syncBody
}
