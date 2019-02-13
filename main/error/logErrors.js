const fs = require('fs')
const {getTime} = require('../utils')

let logErrors = (err, req, res, next) => {
    let path = 'main/error/logs/' + getTime() + '_error.log'
    let error = {
        "originalUrl": req.originalUrl,
        "method": req.route.methods,
        "body": req.body,
        "errMsg": err
    }
    fs.writeFile(path, JSON.stringify(error), "utf-8", (err) => {
        if (err) console.log(err);
    })
    next(err);
}
module.exports = logErrors