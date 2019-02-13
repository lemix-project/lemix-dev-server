let mysql = require('mysql');
const lemixConfig = require('../config').lemix
const Error = require('../error')
let pool = mysql.createPool(lemixConfig);

function query(sql, values, next, type, callback) {
    console.log("db pool");
    pool.getConnection(function (err, connection) {
        if (err) {
            const error = Error["common"]["SERVER_ERROR"]
            next(error)
        } else {
            //Use the connection
            connection.query(sql, values, function (err, results, fields) {
                //每次查询都会 回调
                // callback(err, results);
                //只是释放链接，在缓冲池了，没有被销毁
                if (err) {
                    // 执行sql报错
                    console.log(err);
                    const error = Error[type][err.code]
                    next(error)
                } else if (results.changedRows === 0 && results.affectedRows === 0) {
                    // 增删改操作存在数据参数问题（参数名不对或者参数值为undefined）导致数据操作无效
                    const error = Error[type]['RESOURCE_IS_UNDEFINED']
                    next(error)
                } else {
                    callback(err, results);
                    connection.release();
                }
            });
        }
    });
}

module.exports = {
    query
}