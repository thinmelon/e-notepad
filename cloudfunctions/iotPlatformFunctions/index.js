const login = require('./login/index')
const ota = require('./ota/index')

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case "login":
      return await login.main(event, context)
    case "ota":
      return await ota.main(event, context)
  }
  return event;
}
