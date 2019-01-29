const express = require('express')
const multer = require('multer')
const {connect, getSql, guid} = require('../utils')
const map = require('../maps/module')
const lemixConfig = require('../config').lemix
const errorObj = require('../error')
const upload = multer();
const router = express.Router()

// 查询列表
router.get('/module', (req, res, next) => {
    let data = req.query,
        sql = data.ns_identifier
            ? map.GET + ` WHERE P2.ns_identifier = '${data.ns_identifier}'`
            : map.GET,
        callback = (err, rows) => {
            res.send(rows)
        };
    connect(lemixConfig, sql, callback, next)
})
// 查询明细
router.get('/module/*', (req, res, next) => {
    let urlArray = req.url.split('/'),
        mm_identifier = urlArray[2],
        sql = map.GET + ` WHERE P1.mm_identifier = '${mm_identifier}'`,
        callback = (err, rows) => {
            res.send(rows[0])
        };
    connect(lemixConfig, sql, callback, next)
})
// 新增
router.post('/module', upload.array(), (req, res, next) => {
    let data = req.body,
        params = {
            "#ns_identifier": data.ns_identifier,
            "#mm_identifier": guid(),
            "#mm_name": data.mm_name,
            "#bundle_identifier": data.bundle_identifier,
            "#mm_description": data.mm_description,
            "#create_time": Number(new Date())
        },
        sql = getSql(map.POST, params),
        callback = (err, rows) => {
            let response = {
                "message": "新增成功"
            }
            res.send(JSON.stringify(response))
        }
    connect(lemixConfig, sql, callback, next)
})
// 修改
router.put('/module', upload.array(), (req, res, next) => {
    let data = req.body,
        params = {
            "#mm_identifier": data.mm_identifier,
            "#mm_name": data.mm_name,
            "#mm_description": data.mm_description,
            "#bundle_identifier": data.bundle_identifier
        },
        sql = getSql(map.PUT, params),
        callback = (err, rows) => {
            let message = rows.changedRows === 1
                ? "更新成功"
                : "没有数据更新",
                response = {
                    "message": message
                }
            res.send(JSON.stringify(response))
        }
    connect(lemixConfig, sql, callback, next)
})
// 删除
router.delete('/module', upload.array(), (req, res, next) => {
    let data = req.body;
    for (let key in data) {
        let mm_identifier = data[key].mm_identifier,
            params = {
                "#mm_identifier": mm_identifier
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