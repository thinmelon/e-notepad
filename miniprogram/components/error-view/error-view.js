// components/error-view/error-view.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        errorTips: {
            type: Array,
        },
        logs: {
            type: String,
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        showLog: false,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onBottomButtonClick(e) {
            switch (e.detail.btn.id) {
                case 'restart': {
                    const pages = getCurrentPages();
                    wx.redirectTo({
                        url: `/${pages[pages.length - 1].route}`,
                    });
                    break;
                }
                case 'select-type':
                    // showWifiConfTypeMenu(true);
                    break;
                case 'show-log':
                    this.setData({ showLog: true });
                    break;
                case 'hide-log':
                    this.setData({ showLog: false });
                    break;
                case 'copy-log':
                    wx.setClipboardData({
                        data: this.data.logs,
                    });
                    break;
            }
        },
    }
})
