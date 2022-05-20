const { createStore } = require('../redux');
const reducer = require('./reducer');

const initState = {
  productInfoMap: {},
  deviceDataMap: {},
  deviceStatusMap: {},
  deviceList: [],
  shareDeviceList: [],
  wifiList: [],
};

const store = createStore(reducer, initState);

module.exports = store;
