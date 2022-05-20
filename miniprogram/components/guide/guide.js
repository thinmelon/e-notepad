// components/guide/guide.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {

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
    },
})
