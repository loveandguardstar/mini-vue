import { initState } from "./state";

export function initMixin(Vue) { // 给Vue 增加 init 方法
  Vue.prototype._init = function(options) { // 用于初始化操作
    // 把所有Vue 自定义属性挂载到 this上
    // options 挂载到 this 上，其他的可以用
    const vm = this;
    vm.$options = options // 将用户的选项挂载到实例上

    // 初始化状态
    initState(vm)
  }
}
