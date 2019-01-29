const express = require('express')
const bodyParser = require('body-parser')
const nameSpace = require('./routes/nameSpace')
const mixModule = require('./routes/module')
const moduleVersion = require('./routes/moduleVersion')
const moduleIO = require('./routes/moduleIO')
const logErrors = require('./error/logErrors')
const errorHandler = require('./error/errorHandler')
const {port} = require('./utils')
const app = express()

//设置允许跨域访问该服务
app.all('*', (req, res, next) => {
    // res.header('Access-Control-Allow-Origin', '*')
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header('Access-Control-Allow-Methods', '*')
    res.header('Content-Type', 'application/json;charset=utf-8')
    next()
})

app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use('/lemix', nameSpace)
app.use('/lemix', mixModule)
app.use('/lemix', moduleVersion)
app.use('/lemix', moduleIO)
app.use(logErrors);
app.use(errorHandler)

let server = app.listen(port, () => {
    let host = server.address().address
    let port = server.address().port
    console.log('应用实例，访问地址为：http://%s:%s', host, port)
})