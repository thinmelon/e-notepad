// pages/index/index.js
const actions = require('../../libs/redux/actions');
const app = getApp();
const db = app.wxp.cloud.database();
const PRODUCT_ID = "P7LC2D28JI";
const DEVICE_NAME = "notepad_1";
const TOTAL_SEGMENTS = 2;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        samples: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        db.collection("_action")
            .orderBy('createTime', 'desc')
            .limit(1)
            .where({
                // 填入当前用户 openid，或如果使用了安全规则，则 {openid} 即代表当前用户 openid
                _openid: '{openid}'
            })
            .watch({
                onChange: function (snapshot) {
                    console.log('index.js ==> snapshot', snapshot)
                    const { docChanges } = snapshot;
                    const { dataType = "", queueType = "", updatedFields = {} } = docChanges[0];
                    if (dataType === "update" && queueType === "update") {
                        app.wxp.hideLoading();
                    }
                },
                onError: function (err) {
                    console.error('the watch closed because of error', err)
                }
            })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.showTabBar({
            animation: true,
        })
            .then(res => {
                console.log(res)
            })
    },

    onCellTap: async function (evt) {
        app.wxp.showLoading({ title: "更新中", mask: true });

        const deviceModelId = evt.currentTarget.dataset.scenario;
        const { _id, errMsg } = await this.insertActionRecord(deviceModelId, false, "INIT");
        if (errMsg !== "collection.add:ok") return;

        let inputParams = {
            totalSegments: TOTAL_SEGMENTS,
            actionId: deviceModelId,
            token: _id
        }
        if (deviceModelId === "ACTION_CHANGE_WALLPAPER"
            || deviceModelId === "ACTION_BOOK_ABSTRACTS") {
            inputParams = { ...inputParams, resourceId: "random" }
        }

        console.log(inputParams)
        await this.sendDeviceAction(inputParams).catch(err => {
            app.wxp.hideLoading();
            throw err;
        })
    },

    insertActionRecord: async (deviceModelId, response, result) => {
        return await db.collection("_action")
            .add({
                data: {
                    deviceModelId,
                    response,
                    result,
                    "createTime": db.serverDate()
                }
            })
    },

    sendDeviceAction: async (inputParams) => {
        return await actions.sendDeviceAction({
            ProductId: PRODUCT_ID,
            DeviceName: DEVICE_NAME,
        }, inputParams)
    }

})