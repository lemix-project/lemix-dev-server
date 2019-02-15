const express = require('express')
const multer = require('multer')
const {guid, db} = require('../utils')
const nameSpaceSql = require('../maps/nameSpace')
const Error = require('../error')
const upload = multer();
const router = express.Router()
const _TYPE = 'name_space'
const _ER_BAD_PARAMS = 'ER_BAD_PARAMS'
const _COMMON = 'common'
const _res_er_bad_params = Error[_COMMON][_ER_BAD_PARAMS]

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
    let data = req.body
    if (!data.ns_name) {
        next(_res_er_bad_params)
        return false
    }
    let values = new Array()
    values[0] = guid()
    values[1] = data.ns_name
    values[2] = data.ns_description ? data.ns_description : ""
    db.query(nameSpaceSql.POST, values, next, _TYPE, function () {
        let response = {
            "message": "创建成功"
        }
        res.send(response)
    });
})
// 修改
router.put('/nameSpace', upload.array(), (req, res, next) => {
    let data = req.body
    if (!data.ns_identifier || !data.ns_name || !data.ns_description) {
        next(_res_er_bad_params)
        return false
    }
    let values = [data.ns_name, data.ns_description, data.ns_identifier]
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
    if (!Array.isArray(data)) {
        next(_res_er_bad_params)
        return false
    }
    for (let obj of data) {
        if (!obj.ns_identifier) {
            next(_res_er_bad_params)
            return false
        }
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