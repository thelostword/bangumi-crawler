const routerRes = (
    option = {
        successCode: 200,
        successMsg: 'success',
        failCode: 0,
        failMsg: 'fail'
    }) => {
    return async (ctx, next) => {
        ctx.success = (data, msg) => {
            ctx.type = option.type || 'json'
            ctx.body = {
                code : option.successCode,
                msg : msg || option.successMsg,
                data : data
            }
        }

        ctx.fail = (msg, code) => {
            ctx.type = option.type || 'json'
            ctx.body = {
                code : code || option.failCode,
                msg : msg || option.successMsg,
            }
        }
       await next()
    }
}
 
module.exports= routerRes