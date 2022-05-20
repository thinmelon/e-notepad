const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

// 可在入口函数外缓存 db 对象
const db = cloud.database()

async function coditionUpdate(collection, where, params) {
    const data = { ...params, "updateTime": db.serverDate() }
    return await db.collection(collection)
        .where(where)
        .update({ data })
}

// 云函数入口函数
exports.main = async (event, context) => {
    const { collection, where, data } = event;
    return await coditionUpdate(collection, where, data);
}