// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

// 可在入口函数外缓存 db 对象
const db = cloud.database()

// 数据库查询更新指令对象
const _ = db.command

/**
 *  获取组数据
 */
function getGroupData(collection, where, skip, limit, sort1, sortOption1, sort2, sortOption2) {
    return db.collection(collection)
        //  指定筛选条件
        .where(where)
        //  最多添加两项排序规则
        .orderBy(sort1, sortOption1)
        .orderBy(sort2, sortOption2)
        //  指定查询返回结果时从指定序列后的结果开始返回，用于分页
        .skip(skip)
        //  指定查询结果集数量上限
        .limit(limit)
        .get()
}

// 云函数入口函数
exports.main = async (event, context) => {
    const result = await getGroupData(
        event.collection,
        event.where ? JSON.parse(decodeURIComponent(event.where)) : {},
        parseInt(event.skip) || 0,
        parseInt(event.limit) || 20,
        event.sort1 || "mock",
        event.sortOption1 || "asc",
        event.sort2 || "mock",
        event.sortOption2 || "desc");

    return result;
}