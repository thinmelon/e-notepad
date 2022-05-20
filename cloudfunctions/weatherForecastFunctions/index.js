// 云函数入口文件
const daily = require("./daily/index")
const now = require("./now/index")
// const query = require("./query/index")

// 云函数入口函数
exports.main = async (event, context) => {
    switch (event.type) {
        case 'daily':
            return await daily.main(event, context)
        case 'now':
            return await now.main(event, context)
        // case 'query':
        //     return await query.main(event, context)
    }
    return event;
}