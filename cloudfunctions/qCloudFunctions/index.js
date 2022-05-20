const query = require('./query/index')
const search = require('./search/index')
const regExp = require('./reg-exp/index')
const insert = require('./insert/index')
const watch = require('./watch/index')
const update = require('./update/index')
const where = require('./where/index')

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'query':
      return await query.main(event, context)
    case 'search':
      return await search.main(event, context)
    case 'regExp':
      return await regExp.main(event, context)
    case 'insert':
      return await insert.main(event, context)
    case 'watch':
      return await watch.main(event, context)
    case 'update':
      return await update.main(event, context)
    case 'where':
      return await where.main(event, context)
  }
  return event;
}
