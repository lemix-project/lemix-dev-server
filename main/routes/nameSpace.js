const express = require('express')
const multer = require('multer')
const {connect, getSql, guid} = require('../utils')
const map = require('../maps/nameSpace')
const lemixConfig = require('../config').lemix
const upload = multer();
const router = express.Router()

// 查询
router.get('/nameSpace', (req, res, next) => {
    let data = req.query,
        sql = data.ns_identifier
            ? map.GET + ` WHERE ns_identifier = '${data.ns_identifier}'`
            : map.GET,
        callback = (err, rows) => {
            res.send(rows)
        };
    connect(lemixConfig, sql, callback, next)
})
// 新增
router.post('/nameSpace', upload.array(), (req, res, next) => {
    let params = {
            "#ns_identifier": guid(),
            "#ns_name": req.body.ns_name,
            "#ns_description": req.body.ns_description
        },
        sql = getSql(map.POST, params),
        callback = (err) => {
            let response = {
                "message": "新增成功"
            }
            res.send(JSON.stringify(response))
        }
    connect(lemixConfig, sql, callback, next)
})
// 修改
router.put('/nameSpace', upload.array(), (req, res, next) => {
    let params = {
            "#ns_identifier": req.body.ns_identifier,
            "#ns_name": req.body.ns_name,
            "#ns_description": req.body.ns_description
        },
        sql = getSql(map.PUT, params),
        callback = (err) => {
            let response = {
                "message": "修改成功"
            }
            res.send(JSON.stringify(response))
        }
    connect(lemixConfig, sql, callback, next)
})
// 删除
router.delete('/nameSpace', upload.array(), (req, res, next) => {
    let data = req.body;
    for (let key in data) {
        let ns_identifier = data[key].ns_identifier,
            params = {
                "#ns_identifier": ns_identifier
            },
            sql = getSql(map.DELETE, params),
            callback = (err) => {
                let response = {
                    "message": "删除成功"
                }
                res.send(JSON.stringify(response))
            }
        connect(lemixConfig, sql, callback, next)
    }
})


module.exports = router