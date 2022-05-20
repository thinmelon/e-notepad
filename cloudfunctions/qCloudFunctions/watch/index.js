const cloud = require('wx-server-sdk')

cloud.init()

// 可在入口函数外缓存 db 对象
const db = cloud.database()
// 数据库查询更新指令对象
const _ = db.command

async function watch(collection) {

}

// 云函数入口函数
exports.main = async (event, context) => {
    const { collection } = event;
    return await watch(collection);
}