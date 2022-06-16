export function initLifeCycle(Vue) {
  Vue.prototype._update = function() {
    console.log('update');
  }

  Vue.prototype._render = function() {
    console.log('render')
    const vm = this
    // 让with中的 this 指向 vm
    console.log(vm.age, vm.name);
    return vm.$options.render.call(vm)
  }
}

export function mountComponent(vm, el) {
  // 1.调用 render 方法产生虚拟节点 虚拟DOM

  vm._update(vm._render()) // vm._options.render 虚拟节点

  // 2.根据虚拟 DOM 产生真实DOM
  // 3.插入到 el 元素中
}

// Vue 核心流程 （1）创造响应式数据 （2）模板转换为AST 语法树 （3）将AST 语法树转换成 render 函数 （4）后续每次数据更新可以只执行 render 函数
// render 函数会去产生虚拟节点（使用响应式数据）
// 根据生成的虚拟节点创建真实DOM