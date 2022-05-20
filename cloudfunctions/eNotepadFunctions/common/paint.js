const VERTICAL_PIXELS = 128;

function paint(components) {
    let screen_height = VERTICAL_PIXELS / 8;
    let dotArray = new Array(4736).fill(0xFF);
    
    for (let q = 0; q < components.length; q++) {
        if (components[q].source) {
            let k = 0;
            let offsetX = components[q].startX;
            let offsetY = Math.floor(components[q].startY / 8);
            let width = components[q].width;
            let height = components[q].height / 8;

            for (let i = offsetX; i < width + offsetX; i++) {
                for (let j = offsetY; j < height + offsetY; j++) {
                    dotArray[i * screen_height + j] = (components[q].type === 'CHAR' ? 255 - components[q].source[k++] : components[q].source[k++]);
                }
            }
        }
    }

    return dotArray
}

exports.api = {
    paint
}