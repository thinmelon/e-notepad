// components/wifi-conf/wifi-conf.js
const app = getApp();
const actions = require('../../libs/redux/actions');
const models = require('../../models');
const { getErrorMsg, delay } = require('../../libs/utillib');
const promisify = require('../../libs/wx-promisify');
const { constants: WifiConfConstants } = require('qcloud-iotexplorer-appdev-plugin-wificonf-core');
const { WifiConfStepCode } = WifiConfConstants;

const Steps = {
    Guide: 0,
    InputTargetWiFi: 1,
    ConnectBlueTooth: 2,
    InputDeviceWiFi: 2,
    DoConfig: 3,
    Success: -1,
    Fail: -2,
};

let deviceAdapter = null;

const requestBindDeviceToken = async () => {
    try {
        return await models.createBindDeviceToken();
    } catch (err) {
        console.error('requestBindDeviceToken fail', err);
        wx.showModal({
            title: '获取配网Token失败',
            content: getErrorMsg(err),
            showCancel: false,
            confirmText: '我知道了',
        });
        return null;
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

        pluginName: {
            type: String,
        },

        errorTips: {
            type: Array,
        },

        needDeviceAp: {
            type: Boolean,
            value: false,
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        step: Steps.Guide,
        isReady: false,
        curConnStep: 0,
    },

    attached() {
        console.log('==============  wifi-conf attached  ==============');
        wx.startWifi(); //  初始化 Wi-Fi 模块。
        requestBindDeviceToken().then((token) => {
            if (token) {
                this.bindDeviceToken = token;
                console.log('bindDeviceToken  ===>  ', token)
                this.setData({ isReady: true });
            }
        });
    },

    detached() {
        wx.stopWifi();
        actions.resetWifiList();
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onGuideComplete() {
            this.setData({ step: Steps.InputTargetWiFi });
        },

        onTargetWifiInputComplete(e) {
            this.targetWifi = e.detail.wifi;
            // if (this.data.needDeviceAp) {
            //   // SoftAP配网：需要先连接到设备热点
            //   this.setData({ step: Steps.InputDeviceWiFi });
            // } else if (this.data.pluginName === 'wifiConfBleCombo') {
            //   // Ble-Combo配网 需要先连接蓝牙
            //   this.connectDevice();
            // } else {
            //   // 其他配网方式：已连接到目标WiFi，开始配网
            //   this.startConfig();
            // }
            // 其他配网方式：已连接到目标WiFi，开始配网
            this.startConfig();
        },

        onDeviceWifiInputComplete() {
            // SoftAP配网：已连接到设备热点，开始配网
            this.startConfig();
            // SoftAP配网：未连接到设备热点，开始配网
            // this.startConfig({
            //   softAPInfo: {
            //     SSID: '----',
            //     password: '----'
            //   }
            // });
        },

        onBack() {
            wx.navigateBack();
        },

        onNextStep() {
            this.startConfig();
        },

        onBluetoothConnected(e) {
            console.log('deviceAdapter:', e.detail);
            deviceAdapter = e.detail;
        },

        // SoftAP 配网的 StepCode 与其他配网方式的不同
        onSoftApConfigProgress(data) {
            console.log(this.data.pluginName, 'progress', data);
            // this.logger.info(`${this.data.pluginName}:progress`, data);

            switch (data.code) {
                case WifiConfStepCode.CREATE_UDP_CONNECTION_SUCCESS:
                    this.setData({ curConnStep: 1 });
                    break;
                case WifiConfStepCode.SOFTAP_SEND_TARGET_WIFIINFO_SUCCESS:
                    this.setData({ curConnStep: 2 });
                    break;
                case WifiConfStepCode.SOFTAP_GET_DEVICE_SIGNATURE_SUCCESS:
                case WifiConfStepCode.BUSINESS_QUERY_TOKEN_STATE_SUCCESS:
                    this.setData({ curConnStep: 3 });
                    break;
                case WifiConfStepCode.WIFI_CONF_SUCCESS:
                    this.setData({ curConnStep: 4 });
                    break;
            }
        },

        // ble-combo 事件处理函数
        onBleComboProgress({ code, detail }) {
            console.log(code, detail);
            switch (code) {
                case WifiConfStepCode.PROTOCOL_START:
                    this.setData({ curConnStep: 1 });
                    break;
                case WifiConfStepCode.PROTOCOL_SUCCESS:
                    this.setData({ curConnStep: 2 });
                    break;
                case WifiConfStepCode.BLE_SEND_TOKEN_SUCCESS: {
                    const { productId, deviceName } = detail.response;
                    console.log({ productId, deviceName });
                    this.setData({ curConnStep: 3 });
                    break;
                }
                case WifiConfStepCode.WIFI_CONF_SUCCESS:
                    this.setData({ curConnStep: 4 });
                    break;
            }
        },

        onConfigProgress(data) {
            console.log(this.data.pluginName, 'progress', data);

            switch (data.code) {
                case WifiConfStepCode.PROTOCOL_SUCCESS:
                    this.setData({ curConnStep: 1 });
                    break;
                case WifiConfStepCode.CREATE_UDP_CONNECTION_SUCCESS:
                    this.setData({ curConnStep: 2 });
                    break;
                case WifiConfStepCode.BUSINESS_QUERY_TOKEN_STATE_SUCCESS:
                    this.setData({ curConnStep: 3 });
                    break;
                case WifiConfStepCode.WIFI_CONF_SUCCESS:
                    this.setData({ curConnStep: 4 });
                    break;
            }
        },

        onConfigError(error) {
            console.error(this.data.pluginName, 'error', error);
            // this.logger.error(`${this.data.pluginName}:error`, error);

            const { code, detail } = error;
            let { msg } = error;
            if (!msg && detail && detail.error && detail.error.uiMsg) {
                msg = detail.error.uiMsg;
            }

            wx.showModal({
                title: '配网失败',
                content: `${msg} (${code})`,
                showCancel: false,
                confirmText: '我知道了',
                success: () => {
                    this.setData({
                        step: Steps.Fail,
                        // logs: this.logger.toString(),
                    });
                },
            });
        },

        onConfigComplete(data) {
            console.log(this.data.pluginName, 'complete', data.productId, data.deviceName);
            // this.logger.error(`${this.data.pluginName}:complete`, data);

            this.setData({ step: Steps.Success });

            // 刷新设备列表
            actions.getDevicesData();
        },

        // 这里可以进行一些UI进度更新操作
        onStepChange(progress) {
            console.log(progress);
        },

        onStatusChange(option) {
            console.log(progress);
        },

        startConfig(options = {}) {
            console.log('===========  startConfig  ===========', this.data.pluginName)
            // 切换到开始配网页面
            this.setData({
                step: Steps.DoConfig,
            });

            const progresshandlerMap = {
                wifiConfSoftAp: this.onSoftApConfigProgress.bind(this),
                wifiConfBleCombo: this.onBleComboProgress.bind(this),
            }

            // 调用SDK开始配网
            // const params = {
            //     deviceAdapter, // ble-combo进行配网时需要
            //     wifiConfToken: this.bindDeviceToken,
            //     targetWifiInfo: this.targetWifi,
            //     wifiConfType: 'llsyncble', // ble or llsyncble
            //     autoRetry: true, // 自动处理故障流程
            //     familyId: 'default',
            //     roomId: '0',

            //     onProgress: progresshandlerMap[this.data.pluginName] || this.onConfigProgress.bind(this),
            //     onError: this.onConfigError.bind(this),
            //     onComplete: this.onConfigComplete.bind(this),
            //     ...options,
            // };
            const params = {
                wifiConfToken: this.bindDeviceToken,
                targetWifiInfo: this.targetWifi,
                autoRetry: true, // 自动处理故障流程
                familyId: 'default',
                roomId: '0',
                onProgress: this.onConfigProgress.bind(this),
                onComplete: this.onConfigComplete.bind(this),
                onError: this.onConfigError.bind(this)
            }
            console.log(params)

            app.sdk.plugins[this.data.pluginName].start(params);
        },

    }
})
