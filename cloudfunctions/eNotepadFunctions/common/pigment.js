/**
 * 点阵图
 * 
 */
const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const _ = db.command;

/**
 * 去重
 * @param {*} components 
 */
function removeDuplicate(components) {
    let actions = [];

    components.forEach((element, index) => {
        let result = actions.findIndex(item => {
            return element.collection === item.collection && element.code === item.code;
        })

        if (-1 === result) {
            actions.push({
                "collection": element.collection,
                "code": element.code
            })
        }
    })

    return actions;
}

async function batchGetCharsDotArray(collection, unicodeArray) {
    const result = await db.collection(collection)
        .where({
            _id: _.in(unicodeArray)
        })
        .get()

    return result;
}

async function prepare(components) {
    let actions = removeDuplicate(components);
    // console.log(actions)
    let keys = [];
    actions.forEach((element, index) => {
        let result = keys.findIndex(item => {
            return item.collection === element.collection
        });

        if (-1 === result) {
            keys.push({
                "collection": element.collection,
                "keywords": [element.code]
            })
        } else {
            keys[result].keywords.push(element.code);
        }
    })
    // console.log(keys)

    for (let i = 0; i < keys.length; i++) {
        let result = await batchGetCharsDotArray(keys[i].collection, keys[i].keywords)
        // console.log(result);
        for (let j = 0; j < result.data.length; j++) {
            for (let k = 0; k < components.length; k++) {
                if (components[k].collection === keys[i].collection && components[k].code === result.data[j]._id) {
                    // console.log("Find - index: ", k, result.data[j]._id);
                    components[k].source = result.data[j].dotArray;
                }
            }
        }
    }
    // console.log(components)
    return components;
}

exports.api = {
    prepare
}