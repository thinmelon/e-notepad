const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
    const { _id, segment, total, seed } = event;

    if (!_id || !segment || !total
        || segment <= 0 || segment > total) {
        return {
            code: "CLOUDFUNC_INVALID_PARAMETER",
            msg: "输入的参数有误"
        }
    }

    let result, target;
    if (_id === "random") {
        result = await db.collection('_resource')
            .get();
        target = result.data[parseInt(seed % result.data.length, 10)];
    } else {
        result = await db.collection('_resource')
            .where({ _id })
            .get();
        target = result.data[0];
    }
    // console.log(target)

    const length = target.dotArray.length > 0 ? target.dotArray.length : 0;
    const interval = Math.ceil(length / total);
    const start = (segment - 1) * interval;
    const data = length > 0 ? target.dotArray.slice(start, start + interval) : [];
    return {
        code: 0,
        value: data
    }
}