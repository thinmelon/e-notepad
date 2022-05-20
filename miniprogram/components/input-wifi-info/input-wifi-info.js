// components/input-wifi-info/input-wifi-info.js
const app = getApp();
const { getErrorMsg, delay } = require('../../libs/utillib');
const promisify = require('../../libs/wx-promisify');

const connectWifi = async (wifi) => {
    try {
        if (!app.globalData.isAndroid) {
            // Android 下小程序 connectWifi 会弹出一个“微信连WiFi”的提示框
            wx.showLoading({
                title: 'WiFi连接中',
                mask: true,
            });
        }
        await promisify(wx.connectWifi)(wifi);

        const { wifi: connectedWifi } = await promisify(wx.getConnectedWifi)();
        if (connectedWifi.SSID !== wifi.SSID) {
            throw {
                code: 'SSID_MISMATCH',
            };
        }

        wx.showToast({
            title: 'WiFi连接成功',
            duration: 1500,
        });
        await delay(1500);
    } catch (err) {
        wx.showModal({
            title: 'WiFi连接失败',
            content: getErrorMsg(err),
            confirmText: '我知道了',
            showCancel: false,
        });
        console.error('connect wifi fail', err);
        return Promise.reject(err);
    } finally {
        if (!app.globalData.isAndroid) {
            wx.hideLoading();
        }
    }
};

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        title: {
            type: String,
        },
        autoConnect: {
            type: Boolean,
            value: true,
        },
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    attached() {
        this.wifiForm = this.selectComponent('#wifi-form');
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onBottomButtonClick(e) {
            switch (e.detail.btn.id) {
                case 'refresh-wifi-list':
                    this.wifiForm.triggerWifiListRefresh();
                    break;
                case 'complete':
                    this.onClickComplete();
                    break;
            }
        },

        onClickComplete() {
            const targetWifi = this.wifiForm.getSelectedWifiInfo();
            if (!targetWifi || !targetWifi.SSID) {
                wx.showModal({
                    title: '请先选择WiFi',
                    confirmText: '我知道了',
                    showCancel: false,
                });
                return;
            }

            if (this.data.autoConnect) {
                connectWifi(targetWifi)
                    .then(() => {
                        // app.wifiConfLogger.error('connectWifiSuccess', targetWifi);
                        console.log('>>>> connectWifi >>>>', targetWifi)
                        this.triggerEvent('complete', { wifi: targetWifi }, {});
                    })
                    .catch((err) => {
                        console.log('>>>> connectWifi Error >>>>', err)
                        // app.wifiConfLogger.error('connectWifiFail', err);
                    });
            } else {
                this.triggerEvent('complete', { wifi: targetWifi }, {});
            }
        },
    }
})
