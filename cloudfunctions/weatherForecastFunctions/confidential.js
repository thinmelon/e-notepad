const crypto = require('crypto');
const querystring = require('query-string');
const confidential = require('./confidential');

const privateKey = 'Sdxx5HF_guzJoXFH4';
const publicKey = 'PQxOM1b440wxozg70';

// 心知 V4 接口签名
function signature(paramsObj) {
  const params = Object.assign({}, {
    ttl : 300, 
    ts : Math.round(Date.now() / 1000),
    uid: publicKey
  });
  let result = querystring.stringify(params, { encode: false });
  const sig = crypto
    .createHmac('sha1', privateKey)
    .update(result, 'utf8')
    .digest('base64');

  result += `&sig=${encodeURIComponent(sig)}`;

  return result;
}
exports.main = {
    privateKey,
    publicKey,

    signature
}