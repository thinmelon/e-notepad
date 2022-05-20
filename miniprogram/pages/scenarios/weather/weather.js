// pages/scenarios/weather/weather.js
const actions = require('../../../libs/redux/actions');
const app = getApp()
const db = app.wxp.cloud.database()

const PRODUCT_ID = "P7LC2D28JI";
const DEVICE_NAME = "notepad_1";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        objectMultiArray: [],
        multiIndex: [0, 0],
    },
    provinces: [],
    cities: [],

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.wxp.showLoading({ title: "", mask: true })
        app.wxp.cloud.callFunction({
            name: 'qCloudFunctions',
            data: {
                type: 'query',
                "collection": "_city",
                "limit": 1000
            }
        })
            .then(res => {
                console.log(res)
                res.result.data.forEach((element, index) => {
                    const position = element.administrative.indexOf('/')
                    // console.log(element.administrative, position)
                    if (position < 0) {
                        this.provinces.push({
                            id: index,
                            value: element.administrative
                        });
                        this.cities.push({
                            id: element._id,
                            province: element.administrative,
                            value: element.administrative
                        });
                    } else {
                        const province = element.administrative.substring(0, position);
                        if (-1 === this.provinces.findIndex(item => {
                            return item.value === province;
                        })) {
                            this.provinces.push({
                                id: index,
                                value: province
                            });
                        }

                        this.cities.push({
                            id: element._id,
                            province,
                            value: element.administrative.substring(position + 1)
                        })

                    }
                })

                this.data.objectMultiArray.push(this.provinces)
                this.data.objectMultiArray.push(this.cities.filter(item => {
                    return item.province === this.provinces[0].value;
                }))
                console.log(this.data.objectMultiArray)

                this.setData({
                    objectMultiArray: this.data.objectMultiArray
                })

                app.wxp.hideLoading();
            })
            .catch(err => {
                console.error(err)
            })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        db.collection("_action")
            .orderBy('createTime', 'desc')
            .limit(1)
            .where({
                // 填入当前用户 openid，或如果使用了安全规则，则 {openid} 即代表当前用户 openid
                _openid: '{openid}'
            })
            .watch({
                onChange: function (snapshot) {
                    console.log('snapshot', snapshot)
                    const { docChanges } = snapshot;
                    const { dataType = "", queueType = "", updatedFields = {} } = docChanges[0];
                    if(dataType === "update" && queueType === "update") {
                        app.wxp.hideLoading();
                    }
                },
                onError: function (err) {
                    console.error('the watch closed because of error', err)
                }
            })
    },

    /**
     * 多列选择器按下确认键
     * @param {*} e 
     */
    bindMultiPickerChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            multiIndex: e.detail.value
        })

        app.wxp.showLoading({ title: "更新中", mask: true })

        db.collection("_action")
            .add({
                data: {
                    "deviceModelId": "PROPERTY_CITY_ID",
                    "createTime": db.serverDate(),
                    "code": 0
                }
            })
            .then(res => {
                console.log(res)
                const { _id, errMsg } = res;
                if (errMsg !== "collection.add:ok") return;

                actions.controlDeviceData({
                    ProductId: PRODUCT_ID,
                    DeviceName: DEVICE_NAME,
                }, {
                    id: "PROPERTY_CITY_ID",
                    value: JSON.stringify({
                        "cityId": this.data.objectMultiArray[1][this.data.multiIndex[1]].id,
                        "token": _id
                    })
                })
            })
    },

    /**
     * 多列选择器 - 进行选择，未确认
     * @param {*} e 
     */
    bindMultiPickerColumnChange: function (e) {
        console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
        var data = {
            objectMultiArray: this.data.objectMultiArray,
            multiIndex: this.data.multiIndex
        };
        data.multiIndex[e.detail.column] = e.detail.value;
        switch (e.detail.column) {
            case 0:
                data.objectMultiArray[1] = this.cities.filter(item => {
                    return item.province === this.provinces[e.detail.value].value;
                });
                data.multiIndex[1] = 0;
                break;
        }
        console.log(data.multiIndex);
        this.setData(data);
    },

    bindRegionChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            region: e.detail.value
        })

        app.wxp.cloud.callFunction({
            name: 'qCloudFunctions',
            data: {
                type: 'search',
                "collection": "_city",
                "field": "administrative",
                "regexp": `${e.detail.value[1]}/${e.detail.value[2]}`

            }
        })
            .then(res => {
                console.log(res)
                const { errMsg, data } = res.result;
                if (errMsg != "collection.get:ok") return { errMsg }
                if (!data || data.length === 0) return { errMsg: "CITY NOT FOUND" }
                const cityId = data[0]._id;
                console.log(cityId)

                actions.controlDeviceData({
                    ProductId: 'P7LC2D28JI',
                    DeviceName: 'notepad_1',
                }, {
                    id: "PROPERTY_CITY_ID",
                    value: cityId
                })

            })
            .catch(err => {
                console.error(err)
            })
    }
})