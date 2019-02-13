// 连接池
let connection = {};
connection.mysql = {
    host: "localhost",
    user: "root",
    password: "123456",
    database: "mysql"
}
connection.lemix = {
    host: "localhost",
    user: "root",
    password: "123456",
    database: "lemix"
}
module.exports = connection;