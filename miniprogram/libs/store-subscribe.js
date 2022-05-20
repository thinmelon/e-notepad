const store = require('./redux/index');

/**
 * @typedef {object} StateChangeListener redux state 变化监听器
 * @property {Function} selector 用于从 state 中取出要监听变化的值
 * @property {Function} [onChange] 变化回调函数，被监听的值变化时被调用，第一个参数为变化后的值，第二个参数为变化前的值
 */

/**
 * 注册 redux state 变化监听器
 * @param {StateChangeListener[]} definitions 监听器定义
 * @return {Function} 如果需要注销变化监听器，调用返回的函数即可
 */
module.exports.subscribeStore = (definitions) => {
  const listeners = [];
  const state = store.getState();
  console.log("[[[STORE-SUBSCRIBE.js]]] - subscribeStore - initial state: ", state)

  definitions.forEach(({
    selector,
    onChange = null,
  }) => {
    const initialValue = selector(state);
    console.log("[[[STORE-SUBSCRIBE.js]]] - subscribeStore - initial Value: ", initialValue)
    onChange(initialValue);
    listeners.push({
      selector,
      onChange,
      value: initialValue,
    });
  });

  console.log("[[[STORE-SUBSCRIBE.js]]] - subscribeStore - listeners: ", listeners)

  return store.subscribe(() => {
    const state = store.getState();
    // console.log("[[[STORE-SUBSCRIBE.js]]] - subscribeStore - change state: ", state)
    listeners.forEach((listener) => {
      const { selector, onChange, value: oldValue } = listener;
      const newValue = selector(state);
      console.log(listener, oldValue, newValue)
      if (oldValue !== newValue) { // 浅比较
        // eslint-disable-next-line no-param-reassign
        listener.value = newValue;
        onChange(newValue, oldValue);
      }
    });
  });
};
