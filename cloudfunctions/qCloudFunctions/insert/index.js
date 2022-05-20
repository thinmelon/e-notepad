const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

// 可在入口函数外缓存 db 对象
const db = cloud.database()
// 数据库查询更新指令对象
const _ = db.command

async function insert(collection, data) {
    const action = await db.collection(collection)
        .add({
            data: {
                "createTime": db.serverDate(),
                ...data,
            }
        })

    return action;
}

// 云函数入口函数
exports.main = async (event, context) => {
    const { collection, data } = event;
    return await insert(collection, data);
}

