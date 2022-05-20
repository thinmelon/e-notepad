// 云函数入口文件
// 请填写 物联网开发平台 > 应用开发 中申请的小程序 AppKey 及 AppSecret
const APP_KEY = 'mMyiqzDISMHsrJeUT';
const APP_SECRET = 'ZycAaEDutZkApRkHDlUq';

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

/**
 * 获取物联网开发平台的 AccessToken
 * 请参见 https://cloud.tencent.com/document/product/1081/40781
 * 
 * 说明： 
 * 在完成 sdk.init() 后，请求 TOKEN Api，返回一个 Promise。
 * 若请求成功（code=0），则返回的是一个 resolved 的 Promise，内包含 Token Api 响应中的 Response 部分数据。 
 * 若请求失败，则返回的是一个 rejected 的 Promise，内包含数据结构如：{ code, msg, ...detail }。
 * @param {*} Action 请求的接口 Action 名
 * @param {*} payload （可选）请求接口的数据，API 会自动带上公共参数： AccessToken与RequestId
 * @param {*} options （可选）请求的选项，将透传给 wx.request()。
 */
async function requestAppApi(Action, payload = {}, options = {}) {
    const requestOpts = {
        method: 'POST',
        url: 'https://iot.cloud.tencent.com/api/exploreropen/appapi',
        ...options,
    };

    const finalReqData = { ...payload };

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

