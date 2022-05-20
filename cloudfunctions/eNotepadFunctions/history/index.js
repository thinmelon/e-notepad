/**
 * @brief 获取墨水屏的历史点阵图数据
 */
const cloud = require('wx-server-sdk')
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

async function getWeatherForecastRecord(city) {
    const { errMsg, data: value } = await db.collection('_history')
        .where({
            location: city
        })
        .orderBy("lastUpdateTime", "desc")
        .limit(1)
        .get()

    if (errMsg != "collection.get:ok") { return { code: -1, msg: errMsg } }
    return { code: 0, value }
}

exports.main = async (event, context) => {
    const { scenario, city } = event;
    switch (scenario) {
        case 'WEATHER_FORECAST':
            return await getWeatherForecastRecord(city);
        default:
            return {
                code: "Not found available scenario."
            }
    }
}

