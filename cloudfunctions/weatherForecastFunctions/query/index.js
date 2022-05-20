const axios = require('axios')
const util = require('util');
const uri = require('../uri');
const confidential = require('../confidential');

async function queryWeather(keyword = '北京明天天气怎么样？') {
    const signature = confidential.main.signature();
    const url = util.format(uri.main.API_SENIVERSE_WEATHER_NOW, encodeURIComponent(keyword), signature);
    console.log(url);

    const rsp = await axios.get(url)
        .catch(err => {
            throw err;
        });
    //   console.log('success:', JSON.stringify(rsp.body));
    return rsp;
}

exports.main = async (event, context) => {
    return await queryWeather();
}