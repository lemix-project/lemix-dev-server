// 数据库
let mysql = require('mysql')

let getConnection = (config, sql, callback, next) => {
    let connection = mysql.createConnection(config)
    connection.connect()
    connection.query(sql, (err, rows, fields) => {
        if (err) {
            // 执行sql报错
            const error = {
                'code': err.code,
                'message': '执行sql语句出错',
                'detail': err.sqlMessage,
                'sql': sql
            }
            next(error)
        } else if (rows.changedRows === 0 && rows.affectedRows === 0) {
            // 增删改操作存在数据参数问题（参数名不对或者参数值为undefined）导致数据操作无效
            const error = {
                'code': 'ER_NO_PARAM',
                'message': '请求数据库时出错，请重新检查参数信息',
                'detail': rows,
                'sql': sql
            }
            next(error)
        } else {
            callback(err, rows)
        }
    })
    connection.end()
}


module.exports = getConnection