const designer = require('./design')
const pigment = require('../common/pigment')
const paint = require('../common/paint')

exports.main = async (event, context) => {
    const { time, segment, total } = event;

    if (!time || !segment || !total || segment <= 0 || segment > total) {
        return {
            code: "CLOUDFUNC_INVALID_PARAMETER",
            msg: "输入的参数有误"
        }
    }

    let components;
    designer.api.init();
    components = designer.api.showTime(time)
    components = await pigment.api.prepare(components);
    let result = paint.api.paint(components);
    // console.log(components)
    designer.api.deinit();

    const interval = Math.ceil(result.length / total);
    const start = (segment - 1) * interval;
    const data = result.length > 0 ? result.slice(start, start + interval) : [];

    return {
        code: 0,
        value: data
    };
}