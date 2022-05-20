// pages/factory/factory.js
const actions = require('../../libs/redux/actions');
const app = getApp();
const db = app.wxp.cloud.database();
const PRODUCT_ID = "P7LC2D28JI";
const DEVICE_NAME = "notepad_1";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        defaultSize: 'default',
        primarySize: 'default',
        warnSize: 'default',
        disabled: false,
        plain: true,
        loading: false,
        properties: {
            "PROPERTY_CITY_ID": "FINE",
            "PROPERTY_MACHINE_STATUS": 1,
            "PROPERTY_OP_COUNT": 0
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const that = this;
        db.collection("devices")
            .limit(1)
            .watch({
                onChange: function (snapshot) {
                    console.log('factory.js ==> snapshot', snapshot)
                    const { docChanges } = snapshot;
                    const { dataType = "", queueType = "", updatedFields = {} } = docChanges[0];
                    if (dataType === "update" && queueType === "update") {
                        if (updatedFields.hasOwnProperty("properties.PROPERTY_OP_COUNT")) {
                            that.setData({
                                ["properties.PROPERTY_OP_COUNT"]: updatedFields["properties.PROPERTY_OP_COUNT"]
                            })
                        }
                        if (updatedFields.hasOwnProperty("properties.PROPERTY_MACHINE_STATUS")) {
                            that.setData({
                                ["properties.PROPERTY_MACHINE_STATUS"]: updatedFields["properties.PROPERTY_MACHINE_STATUS"]
                            })
                        }

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

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    onButtonTap: async function (evt) {
        console.log(evt)
        app.wxp.showLoading({ title: "更新中", mask: true });

        const deviceModelId = "ACTION_RESET_OP_COUNT";
        const { _id, errMsg } = await this.insertActionRecord(deviceModelId, false, "INIT");
        if (errMsg !== "collection.add:ok") return;

        let inputParams = {
            actionId: deviceModelId,
            token: _id
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