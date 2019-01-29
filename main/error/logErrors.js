let fs = require('fs')

let logErrors = (err, req, res, next) => {
    let path = 'demo/error/log/' + Number(new Date()) + '_error.log'
    fs.writeFile(path, JSON.stringify(err), "utf-8", (err) => {
        if (err) console.log(err);
    })
    delete err.sql;
    next(err);
}
module.exports = logErrors