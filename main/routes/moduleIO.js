const express = require('express')
const multer = require('multer')
const fs = require('fs')
const {connect, getSql, guid} = require('../utils')
const map = require('../maps/moduleVersion')
const lemixConfig = require('../config').lemix
const upload = multer();
const router = express.Router()
const _basePath = 'base'
const _package = 'package'
const _icon = 'icon'


const _getIconPath = (mmv_identifier) => {
    return _basePath + '/' + _icon + '/' + mmv_identifier
}

const _isUpdateVersion = (rows) => {
    return rows.changedRows === 0 ? false : true
}

const _removeSpace = (str) => {
    return str.replace(/(^\s*)|(\s*$)/g, "")
}

const _writeFiles = ({mmv_identifier, packageBuffer, iconBuffer}) => {
    let packagePath = _getPackagePath(mmv_identifier),
        iconPath = _getIconPath(mmv_identifier);
    fs.writeFileSync(packagePath, packageBuffer)
    fs.writeFileSync(iconPath, iconBuffer)
}

const _unlinkFiles = (mmv_identifier) => {
    let packagePath = _getPackagePath(mmv_identifier),
        iconPath = _getIconPath(mmv_identifier);
    if (fs.existsSync(packagePath) && fs.existsSync(iconPath)) {
        fs.unlinkSync(packagePath);
        fs.unlinkSync(iconPath);
    }
}

// 获取zip和png数据（二进制）
router.get('/base/*/*', (req, res, next) => {
    let urlArray = req.url.split('/'),
        type = urlArray[2],
        mm_identifier = urlArray[3],
        path
    if (type === _package) {
        path = _getPackagePath(mm_identifier)
    } else if (type === _icon) {
        path = _getIconPath(mm_identifier)
    }
    fs.readFile(path, (err, file) => {
        if (err) {
            const error = {
                'code': 'ER_NO_NODE_FS',
                'message': '获取数据出错',
                'detail': err,
                'sql': ''
            }
            next(error)
        } else {
            res.send(file)
        }
    })
})
// 下载zip包
router.get('/download', (req, res) => {
    let mmv_identifier = req.query.mmv_identifier,
        url = _basePath + '/package/' + mmv_identifier + '.zip';
    res.download(url)
})
// 上传
router.put('/upload', upload.any(), (req, res, next) => {
    let data = req.body,
        mmv_identifier = guid(),
        config = data.config,
        version_tag = _removeSpace(config.version),
        param = {
            "#mmv_identifier": mmv_identifier,
            "#bundle_identifier": config.identifier,
            "#description": config.description,
            "#entrance": config.entrance,
            "#package_time": config.package_time,
            "#version_tag": version_tag,
            "#single_flag": config.identifier + '^' + version_tag,
            "#author":config.author
        },
        sql = getSql(map.UPLOAD, param),
        callback = (err, rows) => {
            if (_isUpdateVersion(rows)) {
                /**
                 * 更新版本时，需要替换 icon 和 package
                 */
                let param = {
                        "#single_flag": config.identifier + '^' + version_tag
                    },
                    sql = getSql(map.GET_ID, param),
                    getID = (err, rows) => {
                        let mmv_identifier = rows[0].mmv_identifier,
                            response = {
                                "mmv_identifier": mmv_identifier,
                                "icon_path": _getIconPath(mmv_identifier)
                            }, param = {
                                "mmv_identifier": mmv_identifier,
                                "packageBuffer": new Buffer(data.package.data),
                                "iconBuffer": new Buffer(data.icon.data)
                            }
                        _unlinkFiles(mmv_identifier)
                        _writeFiles(param)
                        res.send(JSON.stringify(response))
                    }
                connect(lemixConfig, sql, getID, next)
            } else {
                let response = {
                    "mmv_identifier": mmv_identifier,
                    "icon_path": _getIconPath(mmv_identifier)
                }, param = {
                    "mmv_identifier": mmv_identifier,
                    "packageBuffer": new Buffer(data.package.data),
                    "iconBuffer": new Buffer(data.icon.data)
                }
                _writeFiles(param)
                res.send(JSON.stringify(response))
            }
        }
    connect(lemixConfig, sql, callback, next)
})
// 获取zip包下载地址
router.get('/getDownloadUrl', (req, res) => {
    let mmv_identifier = req.query.mmv_identifier,
        url = 'http://192.168.11.203:8082/lemix/download?mmv_identifier=' + mmv_identifier;
    res.send(url)
})

const _getPackagePath = (mmv_identifier) => {
    return _basePath + '/' + _package + '/' + mmv_identifier + '.zip'
}

module.exports = router