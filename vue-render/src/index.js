// 不采用Class 是避免把所有的方法都耦合在一起
import { initMixin } from './init'
import { initLifeCycle } from './lifecycle';

function Vue(options) { // options 就是用户的选项
  this._init(options)
}

initMixin(Vue); // 扩展 Vue
initLifeCycle(Vue)

export default Vue