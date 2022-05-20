
let components;
const PIXEL_X = 128;
const PIXEL_Y = 296;
const ABSTRACTS_LEFT = 0;   //  摘要：左边距
const LINE_SPACING = 0;     //  行间距 要是8的整数倍，否则会有偏差
const MAX_CHARS_BY_FONT_SIZE_8 = 518;
const MAX_CHARS_BY_FONT_SIZE_16 = 126;
const MAX_CHARS_BY_FONT_SIZE_24 = 48;
const MAX_CHARS_BY_FONT_SIZE_32 = 27;

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

function addTitle(title) {
    title = `《${title}》`
    console.log('length: ', title.length);

    let titleLeft = Math.floor(Math.floor(Math.floor(PIXEL_Y / 16) - title.length) / 2);

    title.split("").forEach((element, index) => {
        components.push({
            startX: (titleLeft + index) * 16,
            startY: 0,
            width: 16,
            height: 16,
            collection: "_charset_kai_16_16",
            type: "CHAR",
            code: '0x' + element.charCodeAt(0).toString(16).toUpperCase()
        })
    });
    return components;
}

function addAbstracts(abstracts) {
    /** 字体大小 */
    console.log('length: ', abstracts.length);

    let fontSize;
    if (abstracts.length <= MAX_CHARS_BY_FONT_SIZE_32) {
        fontSize = 32;
    } else if (abstracts.length <= MAX_CHARS_BY_FONT_SIZE_24) {
        fontSize = 24;
    } else if (abstracts.length <= MAX_CHARS_BY_FONT_SIZE_16) {
        fontSize = 16;
    } else {
        fontSize = 8;
    }

    console.log("font size: ", fontSize);
    const abstractsTop = 16;   //  摘要：上边距
    const charWidth = fontSize;    //  字体大小 - 宽度
    const charHeight = fontSize;   //  字体大小 - 宽度
    const charsPerLine = Math.floor(PIXEL_Y / fontSize); //  每行字数
    const collection = `_charset_kai_${fontSize}_${fontSize}`;

    abstracts.split("").forEach((element, index) => {
        components.push({
            startX: ABSTRACTS_LEFT + (index % charsPerLine) * charWidth,
            startY: abstractsTop + Math.floor(index / charsPerLine) * (charHeight + LINE_SPACING),
            width: charWidth,
            height: charHeight,
            collection: collection,
            type: "CHAR",
            code: '0x' + element.charCodeAt(0).toString(16).toUpperCase()
        })
    });
    return components;
}

exports.api = {
    init,
    deinit,
    addTitle,
    addAbstracts
}