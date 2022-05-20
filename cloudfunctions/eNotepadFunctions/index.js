const addEpaper = require('./add-epaper/index')
const wallpaper = require('./wallpaper/index')
const weather = require('./weather-forecast/index')
const history = require('./history/index')
const bus = require('./bus-arrival/index')
const clock = require('./clock/index')
const book = require('./book-abstracts/index')

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'add-epaper':
      return await addEpaper.main(event, context)
    case 'wallpaper':
      return await wallpaper.main(event, context)
    case 'weather-forecast':
      return await weather.main(event, context)
    case 'history':
      return await history.main(event, context)
    case 'bus':
      return await bus.main(event, context)
    case 'clock':
      return await clock.main(event, context)
    case 'book-abstracts':
      return await book.main(event, context)

  }
  return event;
}
