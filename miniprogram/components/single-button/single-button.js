// components/single-button/single-button.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        text: {
            type: String,
            value: '',
        },
        type: {
            type: String,
            value: '',
        },
        disabled: {
            type: Boolean,
            value: false,
        },
        icon: {
            type: String,
            value: '',
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

    },

    /**
     * 组件的方法列表
     */
    methods: {
        onClick() {
            this.triggerEvent('click', null, {});
        },
    }
})
