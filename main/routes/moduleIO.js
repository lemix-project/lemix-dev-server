const express = require('express')
const multer = require('multer')
const fs = require('fs')
const {guid, db} = require('../utils')
const map = require('../maps/moduleVersion')
const Error = require('../error')
const upload = multer();
const router = express.Router()
const _basePath = 'base'
const _package = 'package'
const _icon = 'icon'
const _TYPE = 'upload'
const _ER_BAD_PARAMS = 'ER_BAD_PARAMS'
const _COMMON = 'common'
const _res_er_bad_params = Error[_COMMON][_ER_BAD_PARAMS]


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
        mmv_identifier = guid(),
        version_tag,
        packageBuffer,
        iconBuffer
    // 获取Buffer
    if (req.files) {    // form-data 形式上传
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
    } else if (data.package) {  // Json 形式上传
        packageBuffer = new Buffer(data.package)
        iconBuffer = data.icon ? new Buffer(data.icon) : undefined
    }
    if (!packageBuffer) {
        next(_res_er_bad_params)
        return false
    }
    // 校验配置信息
    if (!data.identifier || !data.version || !data.author || !data.entrance || !data.package_time) {
        next(_res_er_bad_params)
        return false
    }
    version_tag = _removeSpace(data.version)
    values[0] = mmv_identifier
    values[1] = data.description ? data.description : ''
    values[2] = data.entrance
    values[3] = data.package_time
    values[4] = version_tag
    values[5] = data.identifier + '^' + version_tag
    values[6] = data.author
    values[7] = data.identifier
    values[8] = data.description ? data.description : ''
    values[9] = data.entrance
    values[10] = data.package_time
    values[11] = data.author

    db.query(map.UPLOAD, values, next, _TYPE, function () {
        let value = data.identifier + '^' + version_tag
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
})
// 获取zip包下载地址
router.get('/getDownloadUrl', (req, res) => {
    let mmv_identifier = req.query.pkid,
        url = 'http://192.168.11.203:8082/lemix/download?pkid=' + mmv_identifier;
    res.send(url)
})

module.exports = router