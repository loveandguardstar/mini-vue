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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
  // 第一个分组就是属性的key value 就是 分组3/分组4/分组五

  var startTagClose = /^\s*(\/?)>/; // <div> <br/>
  // vue3 采用的不是使用正则
  // 对模板进行编译处理  

  function parseHTML(html) {
    // html最开始肯定是一个  </div>
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; // 用于存放元素的

    var currentParent; // 指向的是栈中的最后一个

    var root; // 最终需要转化成一颗抽象语法树

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    } // 利用栈型结构 来构造一颗树


    function start(tag, attrs) {
      var node = createASTElement(tag, attrs); // 创造一个ast节点

      if (!root) {
        // 看一下是否是空树
        root = node; // 如果为空则当前是树的根节点
      }

      if (currentParent) {
        node.parent = currentParent; // 只赋予了parent属性

        currentParent.children.push(node); // 还需要让父亲记住自己
      }

      stack.push(node);
      currentParent = node; // currentParent为栈中的最后一个
    }

    function chars(text) {
      // 文本直接放到当前指向的节点中
      text = text.replace(/\s/g, ' '); // 如果空格超过2就删除2个以上的

      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    function end(tag) {
      stack.pop(); // 弹出最后一个, 校验标签是否合法

      currentParent = stack[stack.length - 1];
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          // 标签名
          attrs: []
        };
        advance(start[0].length); // 如果不是开始标签的结束 就一直匹配下去

        var attr, _end;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false; // 不是开始标签
    }

    while (html) {
      // 如果textEnd 为0 说明是一个开始标签或者结束标签
      // 如果textEnd > 0说明就是文本的结束位置
      var textEnd = html.indexOf('<'); // 如果indexOf中的索引是0 则说明是个标签

      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); // 开始标签的匹配结果

        if (startTagMatch) {
          // 解析到的开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      if (textEnd > 0) {
        var text = html.substring(0, textEnd); // 文本内容

        if (text) {
          chars(text);
          advance(text.length); // 解析到的文本 
        }
      }
    }

    return root;
  }

  function genProps(attrs) {
    var str = ''; // {name,value}

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          // color:red;background:red => {color:'red'}
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            // qs 库
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); // a:b,c:d,
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }}  匹配到的内容就是我们表达式的变量

  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      // 文本
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        //_v( _s(name)+'hello' + _s(name))
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0; // split

        while (match = defaultTagRE.exec(text)) {
          var index = match.index; // 匹配的位置  {{name}} hello  {{name}} hello 

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  }

  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
    return code;
  }

  function compileToFunction(template) {
    // 1.就是将template 转化成ast语法树 转换方式就是用 栈（力扣括号匹配）
    var ast = parseHTML(template); // 2.生成render方法 (render方法执行后的返回的结果就是 虚拟DOM)
    // 模板引擎的实现原理 就是 with  + new Function

    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code); // 根据代码生成render函数
    //  _c('div',{id:'app'},_c('div',{style:{color:'red'}},  _v(_s(vm.name)+'hello'),_c('span',undefined,  _v(_s(age))))

    return render;
  } // <xxx
  // <namepsace:xxx
  // color   =   "asdsada"     c= 'asdasd'  d=  asdasdsa

  function initLifeCycle(Vue) {
    Vue.prototype._update = function () {
      console.log('update');
    };

    Vue.prototype._render = function () {
      console.log('render');
      var vm = this; // 让with中的 this 指向 vm

      console.log(vm.age, vm.name);
      return vm.$options.render.call(vm);
    };
  }
  function mountComponent(vm, el) {
    // 1.调用 render 方法产生虚拟节点 虚拟DOM
    vm._update(vm._render()); // vm._options.render 虚拟节点
    // 2.根据虚拟 DOM 产生真实DOM
    // 3.插入到 el 元素中

  } // Vue 核心流程 （1）创造响应式数据 （2）模板转换为AST 语法树 （3）将AST 语法树转换成 render 函数 （4）后续每次数据更新可以只执行 render 函数
  // render 函数会去产生虚拟节点（使用响应式数据）
  // 根据生成的虚拟节点创建真实DOM

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
      }

      console.log(inserted); // 新增的内容

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

      if (options.el) {
        vm.$mount(options.el); // 实现数据的挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;

      if (!ops.render) {
        // 先查找有没有 render
        var template; // 没有render 看是否有 template,没写template采用外部的 template

        if (!ops.template && el) {
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template;
          }
        } // data 里面写了 template 就用写了的 template


        if (template) {
          var render = compileToFunction(template);
          ops.render = render;
        }

        mountComponent(vm); // 最终可以获取  render 方法
        // script 标签引用的 vue.global.js 这个编译过程是在浏览器运行
        // runtime 是不包含模板编译的，整个编译打包时通过 loader 转译 .vue 文件
      }
    };
  }

  // 不采用Class 是避免把所有的方法都耦合在一起

  function Vue(options) {
    // options 就是用户的选项
    this._init(options);
  }

  initMixin(Vue); // 扩展 Vue

  initLifeCycle(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
