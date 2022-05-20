// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 可在入口函数外缓存 db 对象
const db = cloud.database()

// 数据库查询更新指令对象
const _ = db.command

/**
 * 移除匹配正则表达式的记录 - 筛选带有两个“/”的字段，如"浙江省/丽水市/松阳县"
 * @param {*} collection 
 * @param {*} field 
 * @param {*} regexp 
 */
async function remove(collection, field, regexp) {
    if (collection && field && regexp) {
        const where = {}
        where[field] = db.RegExp({
            regexp: regexp,
            options: 'i',
        })
    
        return await db.collection(collection)
            //  指定筛选条件
            .where(where)
            .remove()
    } else {
        return {
            errMsg: "没有找到相关记录。"
        }
    }
}

// 云函数入口函数
exports.main = async (event, context) => {
    return await remove(
        '_city',
        'administrative',
        `^[\u4E00-\u9FA5]+/[\u4E00-\u9FA5]+/[\u4E00-\u9FA5]+$`,
        );
}


