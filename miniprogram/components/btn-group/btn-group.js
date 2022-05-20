// components/btn-group/btn-group.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        buttons: {
            type: Array,
            value: [],
        },
        noPadding: {
            type: Boolean,
            value: false,
        },
        flex: {
            type: Boolean,
            value: false,
        },
        fixedBottom: {
            type: Boolean,
            value: false,
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        ipx: false,
    },

    options: {
        addGlobalClass: true,
    },

    attached() {
        this.setData({ ipx: getApp().globalData.isIpx });
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onClickBtn(e) {
            this.triggerEvent('click', {
                index: e.currentTarget.dataset.index,
                btn: e.currentTarget.dataset.btn,
            }, {});
        },
    }
})
