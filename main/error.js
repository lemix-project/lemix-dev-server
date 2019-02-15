module.exports = {
    "name_space":{
        "ER_ROW_IS_REFERENCED_2": {
            "code": "NAME_SPACE_HAS_MODULES",
            "message": "命名空间下包含Mix Module，无法删除"
        },
        "ER_DUP_ENTRY": {
            "code": "NAME_SPACE_IS_EXIST",
            "message": "命名空间已存在"
        },
        "RESOURCE_IS_UNDEFINED": {
            "code": "NAME_SPACE_IS_UNDEFINED",
            "message": "错误的命名空间"
        }
    },
    "mix_module":{
        "ER_ROW_IS_REFERENCED_2": {
            "code": "MIX_MODULE_HAS_MODULE_VERSION",
            "message": "Module下含有Version信息，无法删除"
        },
        "ER_DUP_ENTRY": {
            "code": "MIX_MODULE_IS_EXIST",
            "message": "Mix Module已存在"
        },
        "RESOURCE_IS_UNDEFINED": {
            "code": "MIX_MODULE_IS_UNDEFINED",
            "message": "错误的Mix Module"
        },
        "ER_NO_REFERENCED_ROW_2": {
            "code": "NAME_SPACE_IS_UNDEFINED",
            "message": "命名空间不存在"
        }
    },
    "module_version":{
        "ER_DUP_ENTRY": {
            "code": "MODULE_VERSION_IS_EXIST",
            "message": "Module Version已存在"
        },
        "RESOURCE_IS_UNDEFINED": {
            "code": "MODULE_VERSION_IS_UNDEFINED",
            "message": "错误的Module Version"
        },
        "ER_NO_REFERENCED_ROW_2": {
            "code": "MIX_MODULE_IS_UNDEFINED",
            "message": "Mix Module不存在"
        }
    },
    "upload":{
        "RESOURCE_IS_UNDEFINED": {
            "code": "MIX_MODULE_IS_UNDEFINED",
            "message": "错误的Mix Module"
        }
    },
    "common":{
        "SERVER_ERROR":{
            "code":"COMMON_SERVER_INTERNAL_ERROR",
            "message":"服务器内部错误，请联系系统管理员"
        },
        "ER_BAD_PARAMS":{
            "code":"ER_BAD_PARAMS",
            "message":"参数不合法，请确认传参"
        }
    }
}