(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  // 我们希望重写数组中的部分方法
  var oldArrayProto = Array.prototype; // 获取数组的原型
  // newArrayProto.__proto__  = oldArrayProto

  var newArrayProto = Object.create(oldArrayProto);
  var methods = [// 找到所有的变异方法
  'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; // concat slice 都不会改变原数组

  methods.forEach(function (method) {
    // arr.push(1,2,3)
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 这里重写了数组的方法
      // push.call(arr)
      // todo...
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来的方法 ， 函数的劫持  切片编程
      // 我们需要对新增的 数据再次进行劫持


      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case 'push':
        case 'unshift':
          // arr.unshift(1,2,3)
          inserted = args;
          break;

        case 'splice':
          // arr.splice(0,1,{a:1},{a:1})
          inserted = args.slice(2);
      } // console.log(inserted); // 新增的内容


      if (inserted) {
        // 对新增的内容再次进行观测  
        ob.observeArray(inserted);
      }

      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // Object.defineProperty只能劫持已经存在的属性 （vue里面会为此单独写一些api  $set $delete）
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false // 将__ob__ 变成不可枚举 （循环的时候无法获取到）

      }); // data.__ob__ = this; // 给数据加了一个标识 如果数据上有__ob__ 则说明这个属性被观测过了

      if (Array.isArray(data)) {
        // 这里我们可以重写数组中的方法 7个变异方法 是可以修改数组本身的
        data.__proto__ = newArrayProto; // 需要保留数组原有的特性，并且可以重写部分方法

        this.observeArray(data); // 如果数组中放的是对象 可以监控到对象的变化
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象 对属性依次劫持
        // "重新定义"属性   性能差
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        // 观测数组
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(target, key, value) {
    // 闭包  属性劫持
    observe(value); // 对所有的对象都进行属性劫持

    Object.defineProperty(target, key, {
      get: function get() {
        // 取值的时候 会执行get
        console.log('key', key);
        return value;
      },
      set: function set(newValue) {
        // 修改的时候 会执行set
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
      }
    });
  }
  function observe(data) {
    // 对这个对象进行劫持
    if (_typeof(data) !== 'object' || data == null) {
      return; // 只对对象进行劫持
    }

    if (data.__ob__ instanceof Observer) {
      // 说明这个对象被代理过了
      return data.__ob__;
    } // 如果一个对象被劫持过了，那就不需要再被劫持了 (要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过)


    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; // 获取所有实例

    if (opts.data) {
      initData(vm);
    }
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; // data 可能是函数或者对象

    data = typeof data === 'function' ? data.call(this) : data;
    vm._data = data; // 将返回的数据放到Vue自定义对象上
    // 实现响应式的监听

    observe(data); // 将 vm._data 用vm 来代理  

    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  function initMixin(Vue) {
    // 给Vue 增加 init 方法
    Vue.prototype._init = function (options) {
      // 用于初始化操作
      // 把所有Vue 自定义属性挂载到 this上
      // options 挂载到 this 上，其他的可以用
      var vm = this;
      vm.$options = options; // 将用户的选项挂载到实例上
      // 初始化状态

      initState(vm);
    };
  }

  // 不采用Class 是避免把所有的方法都耦合在一起

  function Vue(options) {
    // options 就是用户的选项
    this._init(options);
  }

  initMixin(Vue); // 扩展 Vue

  return Vue;

}));
//# sourceMappingURL=vue.js.map
