//app.js
const { AppDevSdk } = require('qcloud-iotexplorer-appdev-sdk');
const moment = require('moment')
// 请填写 物联网开发平台 > 应用开发 中申请的小程序 AppKey
const APP_KEY = 'mAvTdVDpCdMJBRYFx';

App({
  onLaunch: function () {
    console.log(moment().format())
    const sdk = this.sdk = new AppDevSdk({
      debug: true,
      appKey: APP_KEY,
      getAccessToken: this.getAccessToken,
      wsConfig: {},
      // getAccessToken: () => this.login().then(({ Data }) => Data),
    });

    // 初始化
    sdk.init();

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {}
  },

  // sdk.init() 会调用该函数获取物联网开发平台 AccessToken
  async getAccessToken() {
    // 小程序用户信息
    // 在 page-wrapper 组件中请求获取，写入到 app.globalData.userInfo
    const { userInfo } = this.globalData;

    // 是否需要注册
    const needRegister = !this.getIsRegisteredSync() && !!userInfo;

    // 注册/登录参数，注册时需要传入用户昵称和头像，下次登录时可以不传入
    const loginParams = needRegister ? {
      Avatar: userInfo.avatarUrl,
      NickName: userInfo.nickName,
    } : {};

    try {
      // 云函数 (cloudfunctions/login/index.js) 中调用 微信号注册登录 应用端 API
      // 获取物联网开发平台的 AccessToken
      // 请参见 https://cloud.tencent.com/document/product/1081/40781

      const res = await wx.cloud.callFunction({
        // 云函数名称
        name: 'login',
        // 传给云函数的参数
        data: loginParams,
      });

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
        throw { code: 'CLOUDFUNC_NOT_FOUND', msg: '请创建并部署 cloudfunctions/login 中的云函数到云开发' };
      }
      throw err;
    }
  },

  getIsRegisteredSync() {
    return !!wx.getStorageSync('iot-explorer-user-registered');
  },
})
