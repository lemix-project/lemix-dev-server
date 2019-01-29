const getSql = (sql, params) => {
    for (let key in params) {
        sql = sql.replace(new RegExp(key.toString(), 'g'), params[key]);
    }
    return sql
}

module.exports = getSql