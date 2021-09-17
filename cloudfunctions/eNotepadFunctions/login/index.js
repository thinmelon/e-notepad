// 云函数入口文件
// 请填写 物联网开发平台 > 应用开发 中申请的小程序 AppKey 及 AppSecret
const APP_KEY = 'YOUR APP KEY';
const APP_SECRET = 'YOUR APP SECRET';

const cloud = require('wx-server-sdk');
const crypto = require('crypto-js');
const axios = require('axios');
const { nanoid } = require('nanoid');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

function assignSignature(data) {
    const Timestamp = Math.floor(Date.now() / 1000);
    const Nonce = Math.floor((10000 * Math.random())) + 1; // 随机正整数

    const tempData = {
        ...data,
        Timestamp,
        Nonce,
        AppKey: APP_KEY,
    };

    const keys = Object.keys(tempData).sort();
    const arr = keys
        .filter(key => tempData[key] !== undefined && !!String(tempData[key]))
        .map(key => `${key}=${tempData[key]}`);
    const paramString = arr.join('&');

    const hash = crypto.HmacSHA1(paramString, APP_SECRET);
    const signature = crypto.enc.Base64.stringify(hash);

    return {
        ...tempData,
        Signature: signature,
    };
}

async function requestAppApi(Action, reqData = {}, options = {}) {
    const requestOpts = {
        method: 'POST',
        url: 'https://iot.cloud.tencent.com/api/exploreropen/appapi',
        ...options,
    };

    const finalReqData = { ...reqData };

    if (!finalReqData.RequestId) {
        finalReqData.RequestId = nanoid();
    }
    console.log(finalReqData)

    requestOpts.data = assignSignature({
        Action,
        ...finalReqData,
    });

    const { status, statusText, data: response = {} } = await axios(requestOpts);

    if (status !== 200) {
        return Promise.reject({ code: status, msg: statusText });
    }

    const { code, msg, data = {} } = response;

    if (code) {
        return Promise.reject({ code, msg });
    }

    if (data.Error) {
        return Promise.reject({ code: data.Error.Code, msg: data.Error.Message });
    }

    return data;
}

exports.main = async (event, context) => {
    const { Avatar, NickName } = event;

    try {
        const response = await requestAppApi('AppGetTokenByWeiXin', {
            WxOpenID: cloud.getWXContext().OPENID, // or cloud.getWXContext().UNIONID
            NickName,
            Avatar,
        });

        return { code: 0, msg: 'ok', data: response };
    } catch (err) {
        if (err instanceof Error) {
            return {
                code: 'InternalError',
                msg: String(err),
            };
        }
        return err;
    }
}

