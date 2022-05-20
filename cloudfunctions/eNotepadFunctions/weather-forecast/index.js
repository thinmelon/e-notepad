/**
 * @brief 获取墨水屏的点阵图
 */
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const designer = require('./design')
const pigment = require('../common/pigment')
const paint = require('../common/paint')
// TODO: 让设备自己上报墨水屏屏幕尺寸
const PIXEL_X = 128;
const PIXEL_Y = 296;

exports.main = async (event, context) => {
    let components;
    const { city = "", temperature, text, daily = [] } = event;
    const { data, errMsg } = await db.collection('_city')
        .doc(city)
        .get()


    designer.api.init();
    components = designer.api.addCity(data.city.slice(data.city.lastIndexOf("/") + 1));
    components = designer.api.addWeatherNow(temperature);
    components = designer.api.addWeatherFuture(daily);
    components = await pigment.api.prepare(components);
    let result = paint.api.paint(components);
    designer.api.deinit();

    await db.collection('_history')
        .add({
            data: {
                location: city,
                dotArray: result,
                pixelX: PIXEL_X,
                piexlY: PIXEL_Y,
                lastUpdateTime: new Date()
            }
        })

    return {
        code: 0,
        value: result
    }
}