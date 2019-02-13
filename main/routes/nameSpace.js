const express = require('express')
const multer = require('multer')
const {guid, db} = require('../utils')
const nameSpaceSql = require('../maps/nameSpace')
const upload = multer();
const router = express.Router()
const _TYPE = 'name_space'

// 查询列表
router.get('/nameSpace', (req, res, next) => {
    let results = {}, total,
        size = parseInt(req.query.size || 10),
        current = parseInt(req.query.current || 1),
        start = (current - 1) * size

    db.query(nameSpaceSql.GET_LIST, [start, size], next, _TYPE, function (err, rows) {
        for (let row of rows) {
            total = row.total
            delete row.total
        }
        results.nameSpaceList = rows;
        results.common = {
            'size': size,
            'current': current,
            'count': Math.ceil(total / size),
            'total': total
        }
        res.send(results);
    });
})
// 查询明细
router.get('/nameSpace/*', (req, res, next) => {
    let results = {},
        urlArray = req.url.split('/'),
        ns_identifier = urlArray[2]
    db.query(nameSpaceSql.GET_DETAIL, [ns_identifier], next, _TYPE, function (err, rows) {
        results = rows;
        console.log("results: " + results.str);
        res.send(results[0]);
    });
})
// 新增
router.post('/nameSpace', upload.array(), (req, res, next) => {
    let values = new Array()
    values[0] = guid()
    values[1] = req.body.ns_name
    values[2] = req.body.ns_description
    db.query(nameSpaceSql.POST, values, next, _TYPE, function () {
        let response = {
            "message": "创建成功"
        }
        res.send(response)
    });
})
// 修改
router.put('/nameSpace', upload.array(), (req, res, next) => {
    let values = [req.body.ns_name, req.body.ns_description, req.body.ns_identifier]
    db.query(nameSpaceSql.PUT, values, next, _TYPE, function () {
        let response = {
            "message": "修改成功"
        }
        res.send(response)
    });
})
// 删除
router.delete('/nameSpace', upload.array(), (req, res, next) => {
    let data = req.body, values = new Array();
    for (let obj of data) {
        values.push(obj.ns_identifier)
    }
    db.query(nameSpaceSql.DELETE, [values], next, _TYPE, function () {
        let response = {
            "message": "删除成功"
        }
        res.send(response)
    });
})


module.exports = router