const axios = require('axios')
const util = require('util');
const uri = require('../uri');
const confidential = require('../confidential');

async function getDailyWeather(location = "beijing", language = "zh-Hans", unit = 'c', start = 0, days = 4) {
    
    const query = confidential.main.signature();
    const url = util.format(uri.main.API_SENIVERSE_WEATHER_DAILY, location, language, unit, start, days, query);
    console.log(url);

    const rsp = await axios.get(url)
        .catch(err => {
            throw err;
        });
    //   console.log('success:', JSON.stringify(rsp.body));
    return rsp;
}

exports.main = async (event, context) => {
    return await getDailyWeather();
}