/**
 * @brief 书摘的点阵图
 */
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const designer = require('./design')
const pigment = require('../common/pigment')
const paint = require('../common/paint')

exports.main = async (event, context) => {
    const { _id, segment, total, seed = 0 } = event;

    if (!_id || !segment || !total
        || segment <= 0 || segment > total) {
        return {
            code: "CLOUDFUNC_INVALID_PARAMETER",
            msg: "输入的参数有误"
        }
    }

    let result, abstracts, components;
    if (_id === "random") {
        result = await db.collection('_book_abstracts')
            .get();
        abstracts = result.data[parseInt(seed % result.data.length, 10)];
    } else {
        result = await db.collection('_book_abstracts')
            .where({ _id })
            .get();
        abstracts = result.data[0];
    }

    designer.api.init();
    components = designer.api.addTitle(abstracts.title);
    components = designer.api.addAbstracts(abstracts.abstracts);
    components = await pigment.api.prepare(components);
    let dotArray = paint.api.paint(components);
    // console.log(JSON.stringify(dotArray));
    const length = dotArray.length > 0 ? dotArray.length : 0;
    const interval = Math.ceil(length / total);
    const start = (segment - 1) * interval;
    const dotArraySegment = length > 0 ? dotArray.slice(start, start + interval) : [];
    designer.api.deinit();
    
    return {
        code: 0,
        value: dotArraySegment
    }
}