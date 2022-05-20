const axios = require('axios');
const cloud = require('wx-server-sdk')
const crypto = require('crypto')
const util = require('util')
const uri = require('./uri')

const USER_NAME = "18159393355";
const KEY_SECRET = "7aa6a4b3b9621d5af7e8ae6aa9a07e51";

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

async function querySupportCityList(uid) {
    const url = util.format(uri.main.BUS_ARRIVAL_SUPPORT_CITY_LIST, uid);
    console.log(url);

    const { data } = await axios.get(url)
        .catch(err => {
            throw err;
        });
    //   console.log('success:', JSON.stringify(rsp.body));
    const { error_code, return_code, returl_list } = data;
    if (error_code !== "0") return { code: error_code, msg: return_code }

    /** 保存至云数据库 */
    returl_list.forEach(element => {
        if (element.city === "莆田市")  //  ID: 95
            console.log(element.cityid);
    });
    return returl_list;
}

async function queryBusRouterList(uid, cityid, keywords) {
    const hash = crypto.createHash('md5');
    hash.update(USER_NAME + KEY_SECRET + "luxian");
    const url = util.format(uri.main.BUS_ARRIVAL_ROUTER_LIST, uid, cityid, keywords, hash.digest('hex'));
    console.log(url);

    const { data } = await axios.get(url)
        .catch(err => {
            throw err;
        });
    const { error_code, return_code, returl_list } = data;
    if (error_code !== "0") return { code: error_code, msg: return_code }

    /** 保存至云数据库 */
    returl_list.forEach(element => {
        const { bus_endstan: endStation, bus_linenum: lineNum, bus_linestrid: lineID, bus_staname: lineName, bus_stastan: startStation } = element;
        db.collection('_bus_line')
            .add({ data: { endStation, lineNum, lineID, lineName, startStation } })
            .then(result => {
                console.log(result)
            })
            .catch(err => {
                throw err;
            })
    });

    return returl_list;
}

async function queryBusRealTimePosition(uid, cityid, lineID, lineNum, lineName) {
    const hash = crypto.createHash('md5');
    hash.update(USER_NAME + KEY_SECRET + "rtbus");
    const url = util.format(uri.main.BUS_ARRIVAL_REAL_TIME_POSITION, uid, cityid, lineID, lineNum, lineName, hash.digest('hex'));
    console.log(url);

    const { data } = await axios.get(url)
        .catch(err => {
            throw err;
        });
    return data;
}

exports.main = async (event, context) => {
    // return await querySupportCityList('18159393355')
    // return await queryBusRouterList(USER_NAME, 95, 5, KEY_SECRET);
    return await queryBusRealTimePosition(USER_NAME, 95, "OTAwMDAwMDQ1MDM1", "350300", "51");
}   