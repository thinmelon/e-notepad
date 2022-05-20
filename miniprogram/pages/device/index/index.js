// pages/device/index/index.js
const { subscribeStore } = require('../../../libs/store-subscribe');
const actions = require('../../../libs/redux/actions');
const { secureAddDeviceInFamily } = require('../../../models');
const { getErrorMsg, parseUrl } = require('../../../libs/utillib');
const app = getApp()

const _addDevice = async ({
    Signature,
}) => {
    wx.showLoading({
        title: '绑定设备中…',
        mask: true,
    });
    try {
        await secureAddDeviceInFamily({
            DeviceSignature: Signature,
            RoomId: '',
            FamilyId: 'default',
        });

        wx.showModal({
            title: '绑定设备成功',
            confirmText: '确定',
            showCancel: false,
            success: () => {
                wx.reLaunch({
                    url: '/pages/index/index',
                });
            },
        });
    } catch (err) {
        console.error('addDevice2Family fail', err);
        wx.showModal({
            title: '绑定设备失败',
            content: getErrorMsg(err),
            confirmText: '我知道了',
            showCancel: false,
        });
    } finally {
        wx.hideLoading();
    }
};

const _onInvalidQrCode = () => {
    wx.showModal({
        title: '绑定设备失败',
        content: '扫描的二维码不是有效的绑定设备二维码，请前往物联网开发平台获得绑定设备二维码',
        showCancel: false,
        confirmText: '我知道了',
    });
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        deviceList: [],
        // shareDeviceList: [],
        deviceStatusMap: {},
        inited: false,
        userId: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('======================  onLoad  ======================')
        this.unsubscribeAll = subscribeStore([
            'deviceList',
            // 'shareDeviceList',
            'deviceStatusMap',
        ].map(key => ({
            selector: state => state[key],
            onChange: value => this.setData({ [key]: value }),
        })));
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
        console.log('======================  onUnload  ======================')
        this.unsubscribeAll && this.unsubscribeAll();
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

    onLoginReady() {
        console.log('======================  onLoginReady userId:', app.sdk.uin)
        this.setData({
            userId: app.sdk.uin,
        });
        this.fetchData();
    },

    fetchData() {
        actions.getDevicesData()
            .then(() => {
                console.info('getDevicesData success');
            })
            .catch((err) => {
                console.error('getDevicesData fail', err);
            })
            .finally(() => {
                if (!this.data.inited) {
                    this.setData({ inited: true });
                }
                wx.stopPullDownRefresh();
            });
    },

    showAddDeviceMenu() {
        wx.navigateTo({
            url: '/pages/device/smart-config/smart-config',
        });
        // wx.showActionSheet({
        //     itemList: ['SmartConfig 配网', '扫码绑定设备'],
        //     success: ({ tapIndex }) => {
        //         switch (tapIndex) {
        //             case 0:
        //                 wx.navigateTo({
        //                     url: '/pages/device/smart-config/smart-config',
        //                 });
        //                 break;
        //             case 1:
        //                 this.addDeviceByQrCode();
        //                 break;
        //         }
        //     },
        //     fail(err) {
        //         console.log('fail', err);
        //     }
        // })
    },

    // addDeviceByQrCode() {
    //     wx.scanCode({
    //         scanType: 'qrCode',
    //         success: (res) => {
    //             const qrCodeContent = res.result;
    //             console.log(qrCodeContent)
    //             try {
    //                 let signature = null;
    //                 if (qrCodeContent.startsWith('{')) {
    //                     // JSON: 设备配网二维码
    //                     const data = JSON.parse(qrCodeContent);
    //                     if (!data.Signature) {
    //                         throw { msg: '缺少必要的设备信息字段' };
    //                     }
    //                     signature = data.Signature;
    //                 } else if (qrCodeContent.startsWith('http')) {
    //                     // URL: 虚拟设备调试
    //                     const uri = parseUrl(qrCodeContent);
    //                     if (uri
    //                         && uri.origin === 'https://iot.cloud.tencent.com'
    //                         && uri.pathname === '/iotexplorer/device'
    //                         && uri.query
    //                         && uri.query.page === 'virtual'
    //                         && uri.query.signature
    //                     ) {
    //                         signature = uri.query.signature;
    //                     } else {
    //                         throw { msg: '未知URL' };
    //                     }
    //                 } else {
    //                     throw { msg: '无法识别的二维码内容' };
    //                 }

    //                 _addDevice({
    //                     Signature: signature,
    //                 });
    //             } catch (err) {
    //                 console.error('parse qrcode fail', err, qrCodeContent);
    //                 _onInvalidQrCode();
    //             }
    //         },
    //     });
    // },

    onItemTap: function(evt) {
        console.log(evt)
    }
})