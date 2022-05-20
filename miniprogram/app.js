//app.js
import {
  promisifyAll,
  promisify
} from 'miniprogram-api-promise';

const { AppDevSdk } = require('qcloud-iotexplorer-appdev-sdk');
const { EventTypes } = AppDevSdk.constants;
const SmartConfigPlug = require('qcloud-iotexplorer-appdev-plugin-wificonf-smartconfig').default;
const { subscribeStore } = require('./libs/store-subscribe');
const actions = require('./libs/redux/actions');
// 请填写 物联网开发平台 > 应用开发 中申请的小程序 AppKey
const APP_KEY = 'mMyiqzDISMHsrJeUT';
const ENV_ID = 'cloud1-1ge2a4ff82c6a0bd';

App({
  globalData: {
    userInfo: null,
  },

  onLaunch: function () {
    console.log('======================  APP.JS onLaunch  ======================')
    const systemInfo = wx.getSystemInfoSync();
    const platform = (systemInfo.platform || '').toLowerCase();

    this.globalData = {
      ...this.globalData,
      isIpx: (systemInfo.screenHeight / systemInfo.screenWidth) > 1.86,
      isAndroid: platform.indexOf('android') > -1,
      isIOS: platform.indexOf('ios') > -1,
    };

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: ENV_ID
      })
    }

    // 扩展微信小程序api支持promise
    this.wxp = {}
    promisifyAll(wx, this.wxp);

    const sdk = this.sdk = new AppDevSdk({
      debug: true,  //  （可选）是否为调试模式，默认为: false，开启调试模式后会开启打印调试日志
      appKey: APP_KEY,  //  在物联网开发平台-应用开发-小程序开发 中申请的 AppKey
      getAccessToken: this.getAccessToken,  //  获取 accessToken 的回调，返回一个Promise，内包含 AppGetTokenByWeiXin API 的返回结果
      wsConfig: {},
      // wsConfig: {
      //   autoReconnect: true,  //  （可选）websocket断开后是否自动连接，默认为: true，自动重连每两秒尝试一次
      //   disconnectWhenAppHide: true,  //  （可选）当 App.onHide 触发时，是否自动断开 websocket，默认为: true
      //   connectWhenAppShow: true, //  （可选）当 App.onShow 触发时，是否自动连接 websocket，默认为: true
      //   url: 'wss://iot.cloud.tencent.com/ws/explorer', //  websocket 服务的url，默认为：wss://iot.cloud.tencent.com/ws/explorer
      //   heartbeatInterval: 60000  //  （可选）心跳包的发送间隔，单位毫秒，默认为: 60000
      // }, //  （可选）websocket的配置
    });

    //  初始化sdk，调用后将依次执行：
    //  1. 登录 
    //  2. 连接websocket
    //  sdk.init: (options) => Promise< void >
    //  options.reload?: boolean（可选）是否清理缓存的 Promise 并重新执行
    //  该 API 可同时多次调用（返回同一个缓存的 Promise）。
    // sdk.init();

    // 安装配网插件
    SmartConfigPlug.install(this.sdk);

    // WebSocket 订阅设备信息
    this.subscribe();
  },

  /**
   * sdk.init() 会调用该函数获取物联网开发平台 AccessToken
   */
  async getAccessToken() {
    console.log('======================  getAccessToken  ======================')
    // 小程序用户信息
    // 在 page-wrapper 组件中请求获取，写入到 app.globalData.userInfo
    const { userInfo } = this.globalData;

    // 是否需要注册
    const needRegister = !this.getIsRegisteredSync() && !!userInfo;

    // 注册/登录参数，注册时需要传入用户昵称和头像，下次登录时可以不传入
    let loginParams = needRegister ? {
      Avatar: userInfo.avatarUrl,
      NickName: userInfo.nickName,
    } : {};

    loginParams = { ...loginParams, type: 'login' };
    console.log(loginParams)

    try {
      const res = await wx.cloud.callFunction({
        // 云函数名称
        name: 'iotPlatformFunctions',
        // 传给云函数的参数
        data: loginParams,
      });
      console.log(res)

      const { code, msg, data } = res.result;
      console.log(code, msg, data);
      // 异常处理
      if (code) {
        throw { code, msg };
      }

      // 取得 AccessToken
      const { Token, ExpireAt } = data.Data;

      // 标记为已注册状态，下次登录时不需要请求获取用户昵称和头像
      await this.setIsRegistered();

      return { Token, ExpireAt };
    } catch (err) {
      // 云函数部署指引
      if (err.errMsg && err.errMsg.indexOf('找不到对应的FunctionName') > -1) {
        throw { code: 'CLOUDFUNC_NOT_FOUND', msg: '请创建并部署 eNotepadFunaction/login 中的云函数到云开发' };
      }
      throw err;
    }
  },

  /**
   * 
   * @param {boolean} isRegistered 
   */
  async setIsRegistered(isRegistered = true) {
    console.log('======================  setIsRegistered  ======================')
    if (!isRegistered) {
      return wx.removeStorageSync({
        key: 'iot-explorer-user-registered',
      });
    }

    return wx.setStorageSync({
      key: 'iot-explorer-user-registered',
      data: isRegistered,
    });
  },

  /**
   * 
   */
  getIsRegisteredSync() {
    console.log('======================  getIsRegisteredSync  ======================')
    return !!wx.getStorageSync('iot-explorer-user-registered');
  },

  /**
   * 订阅设备信息
   */
  subscribe() {
    console.log('======================  subscribe  ======================')
    subscribeStore([
      {
        selector: state => state.deviceList.concat(state.shareDeviceList),
        onChange: (deviceList, oldDeviceList) => {
          // 设备列表无变化时不重新订阅
          if (oldDeviceList
            && oldDeviceList.length === deviceList.length
            && deviceList.every((dev, index) => dev === oldDeviceList[index])
          ) {
            return;
          }

          //  当设备列表更新时，重新进行订阅
          //  通过 WebSocket 监听服务端实时推送的设备上下线状态及属性数据。
          //  deviceList  - 设备 ID 列表，或设备信息列表（deviceInfo 需包含 DeviceId 字段）
          this.sdk.subscribeDevices(deviceList);
        },
      },
    ]);

    // EventTypes.WsReport	设备上报数据	{ deviceId, deviceData }
    // EventTypes.WsControl	设备控制数据	{ deviceId, deviceData }
    // EventTypes.WsStatusChange	设备在线状态变更	{ deviceId, deviceStatus }
    // EventTypes.WsEventReport	设备事件上报	{ Payload }
    // EventTypes.WsActionReport	设备行为上报	{ Payload }
    // EventTypes.WsActionPush	设备行为下发	{ Payload }
    // EventTypes.WsPush	WebSocket 推送原始数据	{ push, action, params }
    // EventTypes.WsError	WebSocket 发生错误	WebSocket error 事件的原始错误信息
    // EventTypes.WsClose	WebSocket 连接关闭	{ code, reason }

    // 监听设备上报数据推送
    this.sdk.on(EventTypes.WsReport, ({ deviceId, deviceData }) => {
      console.log('====================== Event[WsReport] 监听设备上报数据推送  ======================')
      actions.updateDeviceDataByPush({ deviceId, deviceData });
    });

    // 监听设备控制数据
    this.sdk.on(EventTypes.WsControl, ({ deviceId, deviceStatus }) => {
      console.log('====================== Event[WsControl] 监听设备控制数据  ======================')
    });

    // 监听设备在线状态变更
    this.sdk.on(EventTypes.WsStatusChange, ({ deviceId, deviceStatus }) => {
      console.log('====================== Event[WsStatusChange] 监听设备在线状态变更  ======================')
      actions.updateDeviceStatusByPush({ deviceId, deviceStatus });
    });

    // 监听设备事件上报
    this.sdk.on(EventTypes.WsEventReport, ({ Payload }) => {
      console.log('====================== Event[WsEventReport] 监听设备事件上报  ======================', Payload)
      // wx.hideLoading({});
    });

    // 监听设备行为上报
    this.sdk.on(EventTypes.WsActionReport, ({ Payload }) => {
      console.log('====================== Event[WsActionReport] 监听设备行为上报  ======================', Payload)
    });

    // 监听设备行为下发
    this.sdk.on(EventTypes.WsActionPush, ({ Payload }) => {
      console.log('====================== Event[WsActionPush] 监听设备行为下发  ======================', Payload)
    });

    // 推送原始数据
    this.sdk.on(EventTypes.WsPush, ({ push, action, params }) => {
      console.log('====================== Event[WsPush] 推送原始数据  ======================', push, action, params)
    });

    // 发生错误
    this.sdk.on(EventTypes.WsError, ({ error }) => {
      console.log('====================== Event[WsError] 发生错误  ======================', error)
    });

    // 连接关闭
    this.sdk.on(EventTypes.WsClose, ({ code, reason }) => {
      console.log('====================== Event[WsClose] 连接关闭  ======================', code, reason)
    });
  }
})
