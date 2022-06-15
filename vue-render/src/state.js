import { observe } from "./observe";

export function initState(vm) {
  const opts = vm.$options; // 获取所有实例
  if (opts.data) {
    initData(vm)
  }
}

function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key]
    },
    set(newValue) {
      vm[target][key] = newValue
    }
  })
} 

function initData(vm) {
  let data = vm.$options.data // data 可能是函数或者对象

  data = typeof data === 'function' ? data.call(this) : data

  vm._data = data // 将返回的数据放到Vue自定义对象上
  // 实现响应式的监听
  
  observe(data)

  // 将 vm._data 用vm 来代理  
  for (let key in data) {
    proxy(vm, '_data', key)
  }
} 