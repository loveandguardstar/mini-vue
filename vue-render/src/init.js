import { compileToFunction } from "./compiler";
import { mountComponent } from "./lifecycle";
import { initState } from "./state";

export function initMixin(Vue) { // 给Vue 增加 init 方法
  Vue.prototype._init = function(options) { // 用于初始化操作
    // 把所有Vue 自定义属性挂载到 this上
    // options 挂载到 this 上，其他的可以用
    const vm = this;
    vm.$options = options // 将用户的选项挂载到实例上

    // 初始化状态
    initState(vm)

    if (options.el) {
      vm.$mount(options.el)  // 实现数据的挂载
    }
  }

  Vue.prototype.$mount = function(el) {
    const vm = this;
    el = document.querySelector(el)
    let ops = vm.$options
    if (!ops.render) { // 先查找有没有 render
      let template; // 没有render 看是否有 template,没写template采用外部的 template
      if (!ops.template && el) {
        template = el.outerHTML
      } else {
        if (el) {
          template = ops.template
        }
      }

      // data 里面写了 template 就用写了的 template
      if (template) {
        const render = compileToFunction(template)
        ops.render = render
      }

      mountComponent(vm, el)
      // 最终可以获取  render 方法
      // script 标签引用的 vue.global.js 这个编译过程是在浏览器运行
      // runtime 是不包含模板编译的，整个编译打包时通过 loader 转译 .vue 文件
    }
  }
}
