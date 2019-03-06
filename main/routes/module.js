const express = require('express')
const fs = require('fs')
const multer = require('multer')
const {guid, db, getPort, getIPAddress} = require('../utils')
const moduleSql = require('../maps/module')
const Error = require('../error')
const upload = multer();
const router = express.Router()
const ipAddress = getIPAddress();
const port = getPort()
const _TYPE = 'mix_module'
const _basePath = 'base'
const _icon = 'icon'
let _icon_buffer = null
const _ER_BAD_PARAMS = 'ER_BAD_PARAMS'
const _COMMON = 'common'
const _res_er_bad_params = Error[_COMMON][_ER_BAD_PARAMS]

const _getIconPath = (mm_identifier) => {
    return _basePath + '/' + _icon + '/' + mm_identifier
}

const _writeFiles = ({mm_identifier, iconBuffer}) => {
    if (mm_identifier) {
        let iconPath = _getIconPath(mm_identifier)
        fs.writeFileSync(iconPath, iconBuffer)
    }
}

const _readFile = () => {
    return fs.readFileSync('main/imgs/defaultIcon.png')
}

const _removeFile = (identifiers) => {
    for (let identifier of identifiers) {
        let filePath = _getIconPath(identifier)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

// 查询列表
router.get('/module', (req, res, next) => {
    let results = {}, total,
        size = parseInt(req.query.size || 10),
        current = parseInt(req.query.current || 1),
        start = (current - 1) * size,
        ns_identifier = req.query.ns_identifier

    db.query(moduleSql.GET_LIST, [ns_identifier, start, size], next, _TYPE, function (err, rows) {
        for (let row of rows) {
            total = row.total
            row.icon_path = 'http://' + ipAddress + ':' + port + '/lemix/' + _basePath + '/icon/' + row['mm_identifier']
            delete row.total
        }
        results.moduleList = rows;
        if (rows.length > 0) {
            results.common = {
                'size': size,
                'current': current,
                'count': Math.ceil(total / size),
                'total': total
            }
        }
        res.send(results);
    });
})
// 查询明细
router.get('/module/*', (req, res, next) => {
    let results = {},
        urlArray = req.url.split('/'),
        mm_identifier = urlArray[2]
    db.query(moduleSql.GET_DETAIL, [mm_identifier], next, _TYPE, function (err, rows) {
        results = rows;
        res.send(results[0]);
    });
})
// 新增
router.post('/module', upload.any(), (req, res, next) => {
    let data = req.body
    if (!data.ns_identifier || !data.mm_name || !data.bundle_identifier) {
        next(_res_er_bad_params)
        return false
    }
    let values = new Array(),
        mm_identifier = data.mm_identifier === '' ? guid() : data.mm_identifier,
        iconBuffer = _icon_buffer === null
            ? _readFile()
            : _icon_buffer[data.mm_identifier]

    values[0] = data.ns_identifier
    values[1] = mm_identifier
    values[2] = data.mm_name
    values[3] = data.bundle_identifier
    values[4] = data.mm_description ? data.mm_description : ''
    values[5] = Number(new Date())
    db.query(moduleSql.POST, values, next, _TYPE, function () {
        let response = {
            'message': '创建成功'
        }
        _icon_buffer = null
        _writeFiles({mm_identifier, iconBuffer})
        res.send(response)
    });
})
// 修改
router.put('/module', upload.array(), (req, res, next) => {
    let data = req.body
    if (!data.mm_name || !data.bundle_identifier || !data.mm_description || !data.mm_identifier) {
        next(_res_er_bad_params)
        return false
    }
    let values = new Array()
    values[0] = data.mm_name
    values[1] = data.mm_description
    values[2] = data.bundle_identifier
    values[3] = data.mm_identifier

    db.query(moduleSql.PUT, values, next, _TYPE, function () {
        let response = {
            'message': '修改成功'
        }
        res.send(response)
    });
})
// 删除
router.delete('/module', upload.array(), (req, res, next) => {
    let data = req.body, values = new Array();
    if (!Array.isArray(data)) {
        next(_res_er_bad_params)
        return false
    }
    for (let obj of data) {
        if (!obj.mm_identifier) {
            next(_res_er_bad_params)
            return false
        }
        values.push(obj.mm_identifier)
    }
    db.query(moduleSql.DELETE, [values], next, _TYPE, function () {
        let response = {
            'message': '删除成功'
        }
        _removeFile(values)
        res.send(response)
    });
})
// 上传图标
router.post('/module/icon', upload.any(), (req, res, next) => {
    let icon_identifier = guid()
    _icon_buffer = {
        [icon_identifier]: req.files[0].buffer
    }
    let response = {
        'mm_identifier': icon_identifier
    }
    res.send(response)
})

module.exports = router