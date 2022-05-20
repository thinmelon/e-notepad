const moment = require('moment')

/**
 * 第一阶段：设计
 */

let components;
const SECTION_LEFT = 0;
const SECTION_TOP = 32;
const DIGITAL_WIDTH = 64;
const DIGITAL_HEIGHT = 64;
const COLON_WIDTH = 32;

/**
 * 初始化Componets数组为空数组
 */
function init() {
    components = [];
}

/**
 * 清空Components数组
 */
function deinit() {
    while (components.length > 0) {
        components.pop();
    }
}

/**
 * 按 HH-MM 格式分割时间，构建绘制区域
 * @param {*} time 
 */
function showTime(time) {
    // const hour = moment().hour()
    // const minute = moment().minute();
    // const hourH = Math.floor(hour / 10);
    // const hourL = hour % 10;
    // const minH = Math.floor(minute / 10);
    // const minL = minute % 10;
    const prefix = 'digital_64_64_';

    // [hourH, hourL, -1, minH, minL].forEach((element, index) => {
    time.split("").forEach((element, index) => {
        components.push({
            startX: index < 3 ? SECTION_LEFT + index * DIGITAL_WIDTH : SECTION_LEFT + COLON_WIDTH + (index - 1) * DIGITAL_WIDTH,
            startY: SECTION_TOP,
            width: DIGITAL_WIDTH,
            height: DIGITAL_HEIGHT,
            collection: "_common",
            type: "TEXT",
            code: element !== "-" ? `${prefix}${element}` : 'digital_64_32_colon'
        })
    });

    return components;
}

exports.api = {
    init,
    deinit,
    showTime,
}