const moment = require('moment')

/**
 * 第一阶段：设计
 */

let components;
const PART_ONE_LEFT = 16;
const PART_ONE_TOP = 12;
const CITY_NAME_CHAR_MARGIN_TOP = -4;
const CITY_NAME_CHAR_WIDTH = 16;
const CITY_NAME_CHAR_HEIGHT = 16;
const TEMPERATURE_WIDTH = 21;
const TEMPERATURE_HEIGHT = 64;
const GAP_WIDTH = 16;
const PART_TWO_LEFT = 128;
const PART_TWO_TOP = 8;
const WEEKDAY_WIDTH = 24;
const WEEKDAY_HEIGHT = 24;
const WEATHER_ICON_WIDTH = 72;
const WEATHER_ICON_HEIGHT = 48
const WEATHER_TEXT_WIDTH = 16;
const WEATHER_TEXT_HEIGHT = 16;
const WEATHER_TEXT_MARGIN_LEFT = 12;
const WEATHER_TEXT_MARGIN_BOTTOM = 8;
const FUTURE_TEMPERATURE_WIDTH = 12;
const FUTURE_TEMPERATURE_HEIGHT = 24

/**
 * 初始化Componets数组为空数组
 */
function init() {
    components = [];
}

function deinit() {
    while (components.length > 0) {
        components.pop();
    }
}

/**
 * 添加地级市名称
 * @param {*} cityName 
 */
function addCity(cityName) {
    cityName.split("").forEach((element, index) => {
        components.push({
            startX: PART_ONE_LEFT + index * CITY_NAME_CHAR_WIDTH,
            startY: PART_ONE_TOP + CITY_NAME_CHAR_MARGIN_TOP,
            width: CITY_NAME_CHAR_WIDTH,
            height: CITY_NAME_CHAR_HEIGHT,
            collection: "_charset_kai_16_16",
            type: "CHAR",
            code: '0x' + element.charCodeAt(0).toString(16).toUpperCase()
        })
    });
    return components;
}

function addWeatherTemperature(temperature, startX, startY, width, height, suffix, cEnable) {
    let temp = Math.abs(temperature);

    if (temperature < 0) {
        let x = Math.floor(temp / 10) > 0 ? startX : startX + width;
        components.push({
            startX: x,
            startY: startY,
            width: width,
            height: height,
            collection: "_common",
            type: "TEXT",
            code: `-${suffix}`
        })
    }

    if (temp < 100) {
        //  十位
        if (Math.floor(temp / 10) > 0) {
            components.push({
                startX: startX + width,
                startY: startY,
                width: width,
                height: height,
                collection: "_common",
                type: "TEXT",
                code: `${Math.floor(temp / 10)}${suffix}`
            })
        }
        //  个位
        components.push({
            startX: startX + width * 2,
            startY: startY,
            width: width,
            height: height,
            collection: "_common",
            type: "TEXT",
            code: `${temp % 10}${suffix}`
        })

        if (cEnable) {
            //  摄氏度
            components.push({
                startX: startX + width * 3,
                startY: startY,
                width: width,
                height: height,
                collection: "_common",
                type: "TEXT",
                code: `c${suffix}`
            })
        }
    }
}

/**
 * 添加实时天气
 * @param {*} temperature 
 */
function addWeatherNow(temperature) {
    addWeatherTemperature(temperature, PART_ONE_LEFT, PART_ONE_TOP + CITY_NAME_CHAR_HEIGHT, TEMPERATURE_WIDTH, TEMPERATURE_HEIGHT, "_21_64", true);
    return components;
}

function addWeatherFuture(days) {
    const weeks = ['日', '一', '二', '三', '四', '五', '六'];
    days.forEach((element, index) => {
        /**
         * 添加星期
         */
        console.log(PART_TWO_LEFT + (WEEKDAY_WIDTH * 3 + GAP_WIDTH) * index)
        console.log(index, PART_TWO_LEFT, WEEKDAY_WIDTH, GAP_WIDTH)
        components.push({
            startX: PART_TWO_LEFT + (WEEKDAY_WIDTH * 3 + GAP_WIDTH) * index,
            startY: PART_TWO_TOP,
            width: WEEKDAY_WIDTH,
            height: WEEKDAY_HEIGHT,
            collection: "_charset_kai_24_24",
            type: "CHAR",
            code: '0x' + '星'.charCodeAt(0).toString(16).toUpperCase()
        })

        components.push({
            startX: PART_TWO_LEFT + WEEKDAY_WIDTH * (1 + 3 * index) + GAP_WIDTH * index,
            startY: PART_TWO_TOP,
            width: WEEKDAY_WIDTH,
            height: WEEKDAY_HEIGHT,
            collection: "_charset_kai_24_24",
            type: "CHAR",
            code: '0x' + '期'.charCodeAt(0).toString(16).toUpperCase()
        })

        components.push({
            startX: PART_TWO_LEFT + WEEKDAY_WIDTH * (2 + 3 * index) + GAP_WIDTH * index,
            startY: PART_TWO_TOP,
            width: WEEKDAY_WIDTH,
            height: WEEKDAY_HEIGHT,
            collection: "_charset_kai_24_24",
            type: "CHAR",
            code: '0x' + weeks[moment(element.date).day()].charCodeAt(0).toString(16).toUpperCase()
        })
        /**
         * 添加未来天气示意图标
         */
        components.push({
            startX: PART_TWO_LEFT + (WEATHER_ICON_WIDTH + GAP_WIDTH) * index,
            startY: PART_TWO_TOP + WEEKDAY_HEIGHT,
            width: WEATHER_ICON_WIDTH,
            height: WEATHER_ICON_HEIGHT,
            collection: "_common",
            type: "ICON",
            code: `weather_code_${element.code_day}`
        })
        /**
         * 添加未来天气文字播报
         */
        const textArray = element.text_day.split("");
        for (let i = 0; i < textArray.length && i < 3; i++) {
            let startX;
            if (textArray.length === 1) {
                startX = PART_TWO_LEFT + WEATHER_TEXT_MARGIN_LEFT * (1 + 2 * index) + WEATHER_TEXT_WIDTH * (1 + 3 * index) + GAP_WIDTH * index;
            } else {
                startX = PART_TWO_LEFT + WEATHER_TEXT_MARGIN_LEFT * (1 + 2 * index) + WEATHER_TEXT_WIDTH * (i + 3 * index) + GAP_WIDTH * index;
            }
            components.push({
                startX,
                startY: PART_TWO_TOP + WEEKDAY_HEIGHT + WEATHER_ICON_HEIGHT,
                width: WEATHER_TEXT_WIDTH,
                height: WEATHER_TEXT_HEIGHT,
                collection: "_charset_kai_16_16",
                type: "CHAR",
                code: '0x' + textArray[i].charCodeAt(0).toString(16).toUpperCase()
            })
        }

        /**
         * 添加未来天气最高温度与最低温度
         */
        addWeatherTemperature(element.high, PART_TWO_LEFT + FUTURE_TEMPERATURE_WIDTH * 6 * index + GAP_WIDTH * index, PART_TWO_TOP + WEEKDAY_HEIGHT + WEATHER_ICON_HEIGHT + WEATHER_TEXT_HEIGHT + WEATHER_TEXT_MARGIN_BOTTOM, FUTURE_TEMPERATURE_WIDTH, FUTURE_TEMPERATURE_HEIGHT, "_12_24", false);

        addWeatherTemperature(element.low, PART_TWO_LEFT + FUTURE_TEMPERATURE_WIDTH * (3 + 6 * index) + GAP_WIDTH * index, PART_TWO_TOP + WEEKDAY_HEIGHT + WEATHER_ICON_HEIGHT + WEATHER_TEXT_HEIGHT + WEATHER_TEXT_MARGIN_BOTTOM, FUTURE_TEMPERATURE_WIDTH, FUTURE_TEMPERATURE_HEIGHT, "_12_24", false);
    });
    return components;
}

exports.api = {
    init,
    deinit,
    addCity,
    addWeatherNow,
    addWeatherFuture,
}
