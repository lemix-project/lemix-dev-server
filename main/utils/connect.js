// 数据库
let mysql = require('mysql')
const Error = require('../error')
let config = require('../config')
let connection = mysql.createConnection(config)

let query = (sql, next, type, callback) => {
    connection.connect()
    connection.query(sql, (err, rows, fields) => {
        if (err) {
            // 执行sql报错
            console.log(err);
            const error = Error[type][err.code]
            // const error = {
            //     'code': err.code,
            //     'message': '',
            //     'detail': err.sqlMessage,
            //     'sql': sql
            // }
            next(error)
        } else if (rows.changedRows === 0 && rows.affectedRows === 0) {
            // 增删改操作存在数据参数问题（参数名不对或者参数值为undefined）导致数据操作无效
            const error = Error[type]['RESOURCE_IS_UNDEFINED']
            // const error = {
            //     'code': 'ER_NO_PARAM',
            //     'message': '资源没找到',
            //     'detail': rows,
            //     'sql': sql
            // }
            next(error)
        } else {
            callback(err, rows)
        }
    })
    connection.end()
}

module.exports = {
    query
}

