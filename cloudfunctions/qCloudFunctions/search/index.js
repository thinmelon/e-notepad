// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 可在入口函数外缓存 db 对象
const db = cloud.database()

// 数据库查询更新指令对象
const _ = db.command

async function fuzzySearch(collection, project, field, regexp, limit) {
    if (collection && field && regexp) {
        const where = {}
        where[field] = db.RegExp({
            regexp: regexp,
            options: 'i',
        })
    
        return await db.collection(collection)
            .field(project)
            //  指定筛选条件
            .where(where)
            //  指定查询结果集数量上限
            .limit(limit)
            .get()
    } else {
        return {
            errMsg: "没有找到相关记录。"
        }
    }
}

// 云函数入口函数
exports.main = async (event, context) => {
    return await fuzzySearch(
        event.collection,
        event.project ? JSON.parse(event.project) : {},
        event.field,
        event.regexp,
        event.limit ? parseInt(event.limit) : 20);
}


