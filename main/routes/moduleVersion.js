const express = require('express')
const multer = require('multer')
const fs = require('fs')
const {connect, getSql, guid, getIPAdress, port} = require('../utils')
const map = require('../maps/moduleVersion')
const lemixConfig = require('../config').lemix
const errorObj = require('../error')
const upload = multer();
const router = express.Router()
const ipAdress = getIPAdress();
const _basePath = 'base'

const _getPackagePath = (mmv_identifier) => {
    return _basePath + '/package/' + mmv_identifier + '.zip'
}

const _getIconPath = (mmv_identifier) => {
    return _basePath + '/icon/' + mmv_identifier
}

const _removeFile = (mmv_identifier) => {
    let packagePath = _getPackagePath(mmv_identifier),
        iconPath = _getIconPath(mmv_identifier);
    if (fs.existsSync(packagePath) && fs.existsSync(iconPath)) {
        fs.unlinkSync(packagePath);
        fs.unlinkSync(iconPath);
    }
}

// 查询列表
router.get('/moduleVersion', (req, res, next) => {
    let data = req.query,
        sql = data.mm_identifier
            ? map.GET + ` WHERE P2.mm_identifier = '${data.mm_identifier}'`
            : map.GET,
        callback = (err, rows) => {
            let ext_list = new Array(),
                response = {
                    "ext_list": ext_list
                }
            for (let index = 0; index < rows.length; index++) {
                let row = rows[index],
                    config = {
                        "identifier": row.bundle_identifier,
                        "version": row.version_tag,
                        "description": row.description,
                        "name": row.mm_name,
                        "author": row.author,
                        "entrance": row.entrance,
                        "package_time": row.package_time
                    };
                ext_list.push({
                    "pkid": row.mmv_identifier,
                    "identifier": config.identifier,
                    "name": config.name,
                    "plugin_path": "http://" + ipAdress + ":" + port + "/lemix/" + _basePath + "/package/" + row["mmv_identifier"] + '.zip',
                    "icon_path": "http://" + ipAdress + ":" + port + "/lemix/" + _basePath + "/icon/" + row["mmv_identifier"],
                    "package_time": row.package_time,
                    "config": config,
                    "downloadUrl": "http://" + ipAdress + ":" + port + "/lemix/download?mmv_identifier=" + row.mmv_identifier
                })
            }
            res.send(response)
        };
    connect(lemixConfig, sql, callback, next)
})
// 查询明细
router.get('/moduleVersion/*', (req, res, next) => {
    let urlArray = req.url.split('/'),
        mmv_identifier = urlArray[2],
        sql = map.GET + ` WHERE P1.mmv_identifier = '${mmv_identifier}'`,
        callback = (err, rows) => {
            let row = rows[0],
                config = {
                    "identifier": row.bundle_identifier,
                    "version": row.version_tag,
                    "description": row.description,
                    "name": row.mm_name,
                    "author": row.author,
                    "entrance": row.entrance,
                    "package_time": row.package_time
                },
                response = {
                    "ext_list": [{
                        "pkid": row.mmv_identifier,
                        "identifier": config.identifier,
                        "name": config.name,
                        "plugin_path": "http://" + ipAdress + ":" + port + "/lemix/" + _basePath + "/package/" + row["mmv_identifier"] + '.zip',
                        "icon_path": "http://" + ipAdress + ":" + port + "/lemix/" + _basePath + "/icon/" + row["mmv_identifier"],
                        "package_time": row.package_time,
                        "config": config,
                        "downloadUrl": "http://" + ipAdress + ":" + port + "/lemix/download?mmv_identifier=" + row.mmv_identifier
                    }]
                }
            res.send(response)
        };
    connect(lemixConfig, sql, callback, next)
})
// 新增
router.post('/moduleVersion', upload.array(), (req, res, next) => {
    let data = req.body,
        params = {
            "#mm_identifier": data.mm_identifier,
            "#mmv_identifier": guid(),
            "#description": data.config.description,
            "#entrance": data.config.entrance,
            "#package_time": data.config.package_time,
            "#version_tag": data.config.version,
            "#author":data.config.author
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
router.put('/moduleVersion', upload.array(), (req, res, next) => {
    let data = req.body,
        params = {
            "#mmv_identifier": data.mmv_identifier,
            "#description": data.description,
            "#version_tag": data.version,
            "#entrance": data.entrance
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
        };
    connect(lemixConfig, sql, callback, next)
})
// 删除
router.delete('/moduleVersion', upload.array(), (req, res, next) => {
    let data = req.body;
    for (let key in data) {
        let mmv_identifier = data[key].mmv_identifier,
            params = {
                "#mmv_identifier": mmv_identifier
            },
            sql = getSql(map.DELETE, params),
            callback = (err) => {
                let response = {
                    "message": "删除成功"
                };
                _removeFile(mmv_identifier);
                res.send(JSON.stringify(response))
            }
        connect(lemixConfig, sql, callback, next)
    }
})

module.exports = router