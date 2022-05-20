const cloud = require('wx-server-sdk')

cloud.init()

// 可在入口函数外缓存 db 对象
const db = cloud.database()

async function update(collection, _id, params) {
    const data = { ...params, "updateTime": db.serverDate() }
    return await db.collection(collection)
        .doc(_id)
        .update({ data })
}

// 云函数入口函数
exports.main = async (event, context) => {
    const { collection, _id, data } = event;
    return await update(collection, _id, data);
}