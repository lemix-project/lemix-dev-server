const express = require('express')
const multer = require('multer')
const fs = require('fs')
const {guid, getIPAddress, getPort, db} = require('../utils')
const versionSql = require('../maps/moduleVersion')
const Error = require('../error')
const upload = multer();
const router = express.Router()
const ipAddress = getIPAddress();
const port = getPort()
const _basePath = 'base'
const _TYPE = 'module_version'
const _ER_BAD_PARAMS = 'ER_BAD_PARAMS'
const _COMMON = 'common'
const _res_er_bad_params = Error[_COMMON][_ER_BAD_PARAMS]

const _getPackagePath = (mmv_identifier) => {
    return _basePath + '/package/' + mmv_identifier + '.zip'
}

const _getIconPath = (mmv_identifier) => {
    return _basePath + '/icon/' + mmv_identifier
}

const _removeFile = (identifiers) => {
    for (let identifier of identifiers) {
        let filePath = _getPackagePath(identifier)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

// 查询列表
router.get('/moduleVersion', (req, res, next) => {
    let data = req.query,
        total = 0,
        mm_identifier = data.mm_identifier,
        size = parseInt(req.query.size || 10),
        current = parseInt(req.query.current || 1),
        start = (current - 1) * size

    db.query(versionSql.GET_LIST, [mm_identifier, start, size], next, _TYPE, function (err, rows) {
        let ext_list = new Array(),
            response = {
                'ext_list': ext_list,
            }
        if (rows.length > 0) {
            total = rows[0].total
            response.common = {
                'size': size,
                'current': current,
                'count': Math.ceil(total / size),
                'total': total
            }
        }
        for (let index = 0; index < rows.length; index++) {
            let row = rows[index],
                config = {
                    'identifier': row.bundle_identifier,
                    'version': row.version_tag,
                    'description': row.description,
                    'name': row.mm_name,
                    'author': row.author,
                    'entrance': row.entrance,
                    'package_time': row.package_time
                };
            ext_list.push({
                'pkid': row.mmv_identifier,
                'identifier': config.identifier,
                'name': config.name,
                'plugin_path': 'http://' + ipAddress + ':' + port + '/lemix/' + _basePath + '/package/' + row['mmv_identifier'] + '.zip',
                'icon_path': 'http://' + ipAddress + ':' + port + '/lemix/' + _basePath + '/icon/' + row['mm_identifier'],
                'package_time': row.package_time,
                'config': config,
                'downloadUrl': 'http://' + ipAddress + ':' + port + '/lemix/download?pkid=' + row.mmv_identifier
            })
            delete row.total
        }
        res.send(response)
    })
})
// 查询明细
router.get('/moduleVersion/*', (req, res, next) => {
    let urlArray = req.url.split('/'),
        mmv_identifier = urlArray[2]

    db.query(versionSql.GET_DETAIL, [mmv_identifier], next, _TYPE, function (err, rows) {
        let ext_list = new Array(),
            response = {
                'ext_list': ext_list
            }
        if (rows.length) {
            let row = rows[0],
                config = {
                    'identifier': row.bundle_identifier,
                    'version': row.version_tag,
                    'description': row.description,
                    'name': row.mm_name,
                    'author': row.author,
                    'entrance': row.entrance,
                    'package_time': row.package_time
                };
            ext_list.push({
                'pkid': row.mmv_identifier,
                'identifier': config.identifier,
                'name': config.name,
                'plugin_path': 'http://' + ipAddress + ':' + port + '/lemix/' + _basePath + '/package/' + row['mmv_identifier'] + '.zip',
                'icon_path': 'http://' + ipAddress + ':' + port + '/lemix/' + _basePath + '/icon/' + row['mm_identifier'],
                'package_time': row.package_time,
                'config': config,
                'downloadUrl': 'http://' + ipAddress + ':' + port + '/lemix/download?pkid=' + row.mmv_identifier
            })
        }
        res.send(response)
    })
})
// 新增
router.post('/moduleVersion', upload.array(), (req, res, next) => {
    let data = req.body
    if (!data.mm_identifier || !data.config || !data.config.version || !data.config.author || !data.config.package_time || !data.config.entrance) {
        next(_res_er_bad_params)
        return false
    }
    let values = new Array()
    values[0] = data.mm_identifier
    values[1] = guid()
    values[2] = data.config.description ? data.config.description : ''
    values[3] = data.config.entrance
    values[4] = data.config.package_time
    values[5] = data.config.version
    values[6] = '^' + data.config.version
    values[7] = data.config.author
    values[8] = data.mm_identifier
    db.query(versionSql.POST, values, next, _TYPE, function (err, rows) {
        let response = {
            'message': '新增成功'
        }
        res.send(JSON.stringify(response))
    })
})
// 修改
router.put('/moduleVersion', upload.array(), (req, res, next) => {
    let data = req.body
    if (!data.pkid || !data.entrance || !data.version || !data.description) {
        next(_res_er_bad_params)
        return false
    }
    let values = new Array()
    values[0] = data.description
    values[1] = data.entrance
    values[2] = data.version
    values[3] = data.pkid

    db.query(versionSql.PUT, values, next, _TYPE, function (err, rows) {
        let message = rows.changedRows === 1
            ? '更新成功'
            : '没有数据更新',
            response = {
                'message': message
            }
        res.send(JSON.stringify(response))
    })
})
// 删除
router.delete('/moduleVersion', upload.array(), (req, res, next) => {
    let data = req.body, values = new Array();
    if (!Array.isArray(data)) {
        next(_res_er_bad_params)
        return false
    }
    for (let obj of data) {
        if (!obj.pkid) {
            next(_res_er_bad_params)
            return false
        }
        values.push(obj.pkid)
    }

    db.query(versionSql.DELETE, [values], next, _TYPE, function (err, rows) {
        let response = {
            'message': '删除成功'
        };
        _removeFile(values);
        res.send(JSON.stringify(response))
    })
})

module.exports = router