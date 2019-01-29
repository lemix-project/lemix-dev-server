let express = require('express')
let multer = require('multer')

let {connect, getSql, guid} = require('../utils/index')
let map = require('../maps/demo')
let demoConfig = require('../config').demo

let upload = multer();
let router = express.Router()

router.get('/userInfo', (req, res) => {
    let params = {
        "#id": req.query.id || "id"
    };
    let sql = getSql(map.GET, params);
    let callback = (err,rows) => {
        res.send(rows)
    };
    connect(demoConfig, sql, callback)
    // npm Binary JSON
    // let BSON = require('bson');
    // let fs = require('fs');
    // fs.readFile('./demo/test.bson', (err, file) => {
    //     if (err) throw err
    //     let doc = BSON.deserialize(file);
    //     /** 通过 node 实现对 Binary JSON 数据的增删改查 **/
    //     console.log(doc);
    //     doc.test = 'Lee';           //  modify
    //     doc.promise = 'promise'     //  add
    //     console.log(doc);
    //     delete doc.promise;         //  delete
    //     console.log(doc);
    // })
})

router.post('/add', upload.array(), (req, res) => {
    let params = {
        "#id": guid(),
        "#name": req.body.name,
        "#age": req.body.age
    };
    let sql = getSql(map.POST, params);
    let callback = (err) => {
        let response = {
            "message": "新增成功"
        }
        res.send(JSON.stringify(response))
    }
    connect(demoConfig, sql, callback)
})

router.put('/edit', upload.array(), (req, res) => {
    let params = {
        "#id": req.body.id,
        "#name": req.body.name,
        "#age": req.body.age
    }
    let sql = getSql(map.PUT, params);
    let callback = (err) => {
        let response = {
            "message": "修改成功"
        }
        res.send(JSON.stringify(response))
    }
    connect(demoConfig, sql, callback)
})

router.delete('/delete', upload.array(), (req, res) => {
    let ids = req.body;
    for (let key in ids) {
        if (ids[key].id) {
            let params = {
                "#id": ids[key].id
            }
            console.log(params);
            let sql = getSql(map.DELETE, params);
            let callback = (err) => {
                let response = {
                    "message": "删除成功"
                }
                res.send(JSON.stringify(response))
            }
            connect(demoConfig, sql, callback)
        } else {
            let response = {
                "error": "field id is undefined"
            }
            res.status(400);
            res.send(JSON.stringify(response))
        }
    }
    // let params = {
    //     "#id": req.body.id
    // }
    // let sql = getSql(map.DELETE, params);
    // let callback = () => {
    //     let response = {
    //         "message": "删除成功"
    //     }
    //     res.send(JSON.stringify(response))
    // }
    // connect(demoConfig, sql, callback)
})

router.put('/upload', upload.any(), function (req, res, next) {
    console.log(req.files[0]);  // 上传的文件信息
    let buffer = req.files[0].buffer;
    let des_file = "./upload/" + req.files[0].originalname;
    if (!fs.existsSync('./upload')) {
        fs.mkdirSync('./upload');
    }
    fs.writeFile(des_file, buffer, function (err) {
        if (err) {
            console.log(err);
        } else {
            let response = {
                message: 'File uploaded successfully',
                filename: req.files[0].originalname
            };
            console.log(response);
            res.end('ok');
        }
    });
})

router.get('/download', function (req, res) {
    res.download('./upload/集团管理员.html');
})

module.exports = router