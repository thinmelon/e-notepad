// components/do-config/do-config.js
const connectDeviceSteps = [
    '手机与设备连接成功',
    '向设备发送信息成功',
    '设备连接云端成功',
    '初始化成功',
];


Component({
    /**
     * 组件的属性列表
     */
    properties: {
        curStep: {
            type: Number,
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        connectDeviceSteps,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onBottomButtonClick(e) {
            switch (e.detail.btn.id) {
                case 'select-type':
                    // showWifiConfTypeMenu(true);
                    break;
                case 'complete':
                    this.triggerEvent('complete', {}, {});
                    break;
            }
        },
    }
})
