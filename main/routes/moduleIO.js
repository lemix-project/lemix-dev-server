const express = require('express')
const multer = require('multer')
const fs = require('fs')
const {guid, db} = require('../utils')
const map = require('../maps/moduleVersion')
const upload = multer();
const router = express.Router()
const _basePath = 'base'
const _package = 'package'
const _icon = 'icon'
const _TYPE = 'upload'


const _getIconPath = (mm_identifier) => {
    return _basePath + '/' + _icon + '/' + mm_identifier
}

const _isUpdateVersion = (rows) => {
    return rows.changedRows === 0 ? false : true
}

const _removeSpace = (str) => {
    return str.replace(/(^\s*)|(\s*$)/g, "")
}

const _writeFiles = ({mmv_identifier, mm_identifier, packageBuffer, iconBuffer}) => {
    if (mmv_identifier && packageBuffer) {
        let packagePath = _getPackagePath(mmv_identifier)
        fs.writeFileSync(packagePath, packageBuffer)
    }
    if (mm_identifier && iconBuffer) {
        let iconPath = _getIconPath(mm_identifier)
        fs.writeFileSync(iconPath, iconBuffer)
    }
}

const _unlinkFiles = (mmv_identifier) => {
    let packagePath = _getPackagePath(mmv_identifier)
    if (fs.existsSync(packagePath)) {
        fs.unlinkSync(packagePath);
    }
}

const _getPackagePath = (mmv_identifier) => {
    return _basePath + '/' + _package + '/' + mmv_identifier + '.zip'
}

// 获取zip和png数据（二进制）
router.get('/base/*/*', (req, res, next) => {
    let urlArray = req.url.split('/'),
        type = urlArray[2],
        mmv_identifier = urlArray[3],
        path
    if (type === _package) {
        path = _getPackagePath(mmv_identifier)
    } else if (type === _icon) {
        path = _getIconPath(mmv_identifier)
    }
    fs.readFile(path, (err, file) => {
        if (err) {
            const error = {
                'code': 'ER_NO_NODE_FS',
                'message': '获取数据出错',
                'detail': err
            }
            next(error)
        } else {
            res.send(file)
        }
    })
})
// 下载zip包
router.get('/download', (req, res) => {
    let mmv_identifier = req.query.pkid,
        url = _basePath + '/package/' + mmv_identifier + '.zip';
    res.download(url)
})
// 上传
router.put('/upload', upload.any(), (req, res, next) => {
    let data = req.body,
        values = new Array(),
        config = {},
        mmv_identifier = guid(),
        version_tag,
        packageBuffer,
        iconBuffer
    if (req.files) {
        for (let file of req.files) {
            switch (file.fieldname) {
                case 'package':
                    packageBuffer = file.buffer
                    break
                case 'icon':
                    iconBuffer = file.buffer
                    break
            }
        }
    } else {
        packageBuffer = new Buffer(data.package)
        iconBuffer = data.icon ? new Buffer(data.icon) : undefined
    }
    if (data.config) {
        config = typeof data.config === 'string'
            ? JSON.parse(data.config)
            : data.config
        version_tag = _removeSpace(config.version)
        values[0] = mmv_identifier
        values[1] = config.description
        values[2] = config.entrance
        values[3] = config.package_time
        values[4] = config.version
        values[5] = config.identifier + '^' + version_tag
        values[6] = config.author
        values[7] = config.identifier
        values[8] = config.description
        values[9] = config.entrance
        values[10] = config.package_time
        values[11] = config.author
    }
    db.query(map.UPLOAD, values, next, _TYPE, function () {
        let value = config.identifier + '^' + version_tag
        db.query(map.GET_ID, [value], next, _TYPE, function (err, rows) {
            /**
             * 更新版本时，需要替换 icon 和 package
             */
            let mmv_identifier = rows[0].mmv_identifier,
                mm_identifier = rows[0].mm_identifier
            if (_isUpdateVersion(rows)) {
                let response = {
                    "pkid": mmv_identifier,
                    "icon_path": _getIconPath(mm_identifier)
                }, param = {
                    "mmv_identifier": mmv_identifier,
                    "mm_identifier": mm_identifier,
                    "packageBuffer": packageBuffer,
                    "iconBuffer": iconBuffer
                }
                _unlinkFiles(mmv_identifier)
                _writeFiles(param)
                res.send(JSON.stringify(response))
            } else {
                let response = {
                    "pkid": mmv_identifier,
                    "icon_path": _getIconPath(mm_identifier)
                }, param = {
                    "mmv_identifier": mmv_identifier,
                    "mm_identifier": mm_identifier,
                    "packageBuffer": packageBuffer,
                    "iconBuffer": iconBuffer
                }
                _writeFiles(param)
                res.send(JSON.stringify(response))
            }
        })
    })
    // let data = req.body,
    //     mmv_identifier = guid(),
    //     config = data.config,
    //     version_tag = _removeSpace(config.version),
    //     param = {
    //         "#mmv_identifier": mmv_identifier,
    //         "#bundle_identifier": config.identifier,
    //         "#description": config.description,
    //         "#entrance": config.entrance,
    //         "#package_time": config.package_time,
    //         "#version_tag": version_tag,
    //         "#single_flag": config.identifier + '^' + version_tag,
    //         "#author": config.author
    //     },
    //     sql = getSql(map.UPLOAD, param),
    //     callback = (err, rows) => {
    //         if (_isUpdateVersion(rows)) {
    //             /**
    //              * 更新版本时，需要替换 icon 和 package
    //              */
    //             let param = {
    //                     "#single_flag": config.identifier + '^' + version_tag
    //                 },
    //                 sql = getSql(map.GET_ID, param),
    //                 getID = (err, rows) => {
    //                     let mmv_identifier = rows[0].mmv_identifier,
    //                         response = {
    //                             "mmv_identifier": mmv_identifier,
    //                             "icon_path": _getIconPath(mmv_identifier)
    //                         }, param = {
    //                             "mmv_identifier": mmv_identifier,
    //                             "packageBuffer": new Buffer(data.package.data),
    //                             "iconBuffer": new Buffer(data.icon.data)
    //                         }
    //                     _unlinkFiles(mmv_identifier)
    //                     _writeFiles(param)
    //                     res.send(JSON.stringify(response))
    //                 }
    //             connect(lemixConfig, sql, getID, next)
    //         } else {
    //             let response = {
    //                 "mmv_identifier": mmv_identifier,
    //                 "icon_path": _getIconPath(mmv_identifier)
    //             }, param = {
    //                 "mmv_identifier": mmv_identifier,
    //                 "packageBuffer": new Buffer(data.package.data),
    //                 "iconBuffer": new Buffer(data.icon.data)
    //             }
    //             _writeFiles(param)
    //             res.send(JSON.stringify(response))
    //         }
    //     }
    // connect(lemixConfig, sql, callback, next)
})
// 获取zip包下载地址
router.get('/getDownloadUrl', (req, res) => {
    let mmv_identifier = req.query.pkid,
        url = 'http://192.168.11.203:8082/lemix/download?pkid=' + mmv_identifier;
    res.send(url)
})

module.exports = router