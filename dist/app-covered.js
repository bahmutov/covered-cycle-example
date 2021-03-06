(function (modules) {
  var installedModules = {};
  function __webpack_require__(moduleId) {
    if (installedModules[moduleId])
      return installedModules[moduleId].exports;
    var module = installedModules[moduleId] = {
      exports: {},
      id: moduleId,
      loaded: false
    };
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    module.loaded = true;
    return module.exports
  }
  __webpack_require__.m = modules;
  __webpack_require__.c = installedModules;
  __webpack_require__.p = '';
  return __webpack_require__(0)
}([
  function (module, exports, __webpack_require__) {
    const Cycle = __webpack_require__(1);
    const Rx = __webpack_require__(2);
    const {makeDOMDriver, div, button} = __webpack_require__(5);
    function main({DOM}) {
      const add$ = DOM.select('.add').events('click').map(ev => 1);
      const sub$ = DOM.select('.sub').events('click').map(ev => -1);
      const count$ = Rx.Observable.merge(add$, sub$).startWith(0).scan((total, change) => total + change);
      return {
        DOM: count$.map(count => div('.counter', [
          'Count: ' + count,
          button('.add', 'Add'),
          button('.sub', 'Sub')
        ]))
      }
    }
    Cycle.run(main, { DOM: makeDOMDriver('#app') })
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var Rx = __webpack_require__(2);
    function makeSinkProxies(drivers) {
      var sinkProxies = {};
      var keys = Object.keys(drivers);
      for (var i = 0; i < keys.length; i++) {
        sinkProxies[keys[i]] = new Rx.ReplaySubject(1)
      }
      return sinkProxies
    }
    function callDrivers(drivers, sinkProxies) {
      var sources = {};
      var keys = Object.keys(drivers);
      for (var i = 0; i < keys.length; i++) {
        var _name = keys[i];
        sources[_name] = drivers[_name](sinkProxies[_name], _name)
      }
      return sources
    }
    function attachDisposeToSinks(sinks, replicationSubscription) {
      return Object.defineProperty(sinks, 'dispose', {
        value: function value() {
          replicationSubscription.dispose()
        }
      })
    }
    function makeDisposeSources(sources) {
      return function dispose() {
        var keys = Object.keys(sources);
        for (var i = 0; i < keys.length; i++) {
          var source = sources[keys[i]];
          if (typeof source.dispose === 'function') {
            source.dispose()
          }
        }
      }
    }
    function attachDisposeToSources(sources) {
      return Object.defineProperty(sources, 'dispose', { value: makeDisposeSources(sources) })
    }
    var logToConsoleError = typeof console !== 'undefined' && console.error ? function (error) {
      console.error(error.stack || error)
    } : Function.prototype;
    function replicateMany(observables, subjects) {
      return Rx.Observable.create(function (observer) {
        var subscription = new Rx.CompositeDisposable();
        setTimeout(function () {
          var keys = Object.keys(observables);
          for (var i = 0; i < keys.length; i++) {
            var _name2 = keys[i];
            if (subjects.hasOwnProperty(_name2) && !subjects[_name2].isDisposed) {
              subscription.add(observables[_name2].doOnError(logToConsoleError).subscribe(subjects[_name2].asObserver()))
            }
          }
          observer.onNext(subscription)
        });
        return function dispose() {
          subscription.dispose();
          var keys = Object.keys(subjects);
          for (var i = 0; i < keys.length; i++) {
            subjects[keys[i]].dispose()
          }
        }
      })
    }
    function run(main, drivers) {
      if (typeof main !== 'function') {
        throw new Error('First argument given to Cycle.run() must be the \'main\' ' + 'function.')
      }
      if (typeof drivers !== 'object' || drivers === null) {
        throw new Error('Second argument given to Cycle.run() must be an object ' + 'with driver functions as properties.')
      }
      if (Object.keys(drivers).length === 0) {
        throw new Error('Second argument given to Cycle.run() must be an object ' + 'with at least one driver function declared as a property.')
      }
      var sinkProxies = makeSinkProxies(drivers);
      var sources = callDrivers(drivers, sinkProxies);
      var sinks = main(sources);
      var subscription = replicateMany(sinks, sinkProxies).subscribe();
      var sinksWithDispose = attachDisposeToSinks(sinks, subscription);
      var sourcesWithDispose = attachDisposeToSources(sources);
      return {
        sources: sourcesWithDispose,
        sinks: sinksWithDispose
      }
    }
    var Cycle = { run: run };
    module.exports = Cycle
  },
  function (module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    (function (module, global, process) {
      ;
      (function (undefined) {
        var objectTypes = {
          'function': true,
          'object': true
        };
        function checkGlobal(value) {
          return value && value.Object === Object ? value : null
        }
        var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType ? exports : null;
        var freeModule = objectTypes[typeof module] && module && !module.nodeType ? module : null;
        var freeGlobal = checkGlobal(freeExports && freeModule && typeof global === 'object' && global);
        var freeSelf = checkGlobal(objectTypes[typeof self] && self);
        var freeWindow = checkGlobal(objectTypes[typeof window] && window);
        var moduleExports = freeModule && freeModule.exports === freeExports ? freeExports : null;
        var thisGlobal = checkGlobal(objectTypes[typeof this] && this);
        var root = freeGlobal || freeWindow !== (thisGlobal && thisGlobal.window) && freeWindow || freeSelf || thisGlobal || Function('return this')();
        var Rx = {
          internals: {},
          config: { Promise: root.Promise },
          helpers: {}
        };
        var noop = Rx.helpers.noop = function () {
          }, identity = Rx.helpers.identity = function (x) {
            return x
          }, defaultNow = Rx.helpers.defaultNow = Date.now, defaultComparer = Rx.helpers.defaultComparer = function (x, y) {
            return isEqual(x, y)
          }, defaultSubComparer = Rx.helpers.defaultSubComparer = function (x, y) {
            return x > y ? 1 : x < y ? -1 : 0
          }, defaultKeySerializer = Rx.helpers.defaultKeySerializer = function (x) {
            return x.toString()
          }, defaultError = Rx.helpers.defaultError = function (err) {
            throw err
          }, isPromise = Rx.helpers.isPromise = function (p) {
            return !!p && typeof p.subscribe !== 'function' && typeof p.then === 'function'
          }, isFunction = Rx.helpers.isFunction = function () {
            var isFn = function (value) {
              return typeof value == 'function' || false
            };
            if (isFn(/x/)) {
              isFn = function (value) {
                return typeof value == 'function' && toString.call(value) == '[object Function]'
              }
            }
            return isFn
          }();
        function cloneArray(arr) {
          for (var a = [], i = 0, len = arr.length; i < len; i++) {
            a.push(arr[i])
          }
          return a
        }
        var errorObj = { e: {} };
        function tryCatcherGen(tryCatchTarget) {
          return function tryCatcher() {
            try {
              return tryCatchTarget.apply(this, arguments)
            } catch (e) {
              errorObj.e = e;
              return errorObj
            }
          }
        }
        var tryCatch = Rx.internals.tryCatch = function tryCatch(fn) {
          if (!isFunction(fn)) {
            throw new TypeError('fn must be a function')
          }
          return tryCatcherGen(fn)
        };
        Rx.config.longStackSupport = false;
        var hasStacks = false, stacks = tryCatch(function () {
            throw new Error()
          })();
        hasStacks = !!stacks.e && !!stacks.e.stack;
        var rStartingLine = captureLine(), rFileName;
        var STACK_JUMP_SEPARATOR = 'From previous event:';
        function filterStackString(stackString) {
          var lines = stackString.split('\n'), desiredLines = [];
          for (var i = 0, len = lines.length; i < len; i++) {
            var line = lines[i];
            if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
              desiredLines.push(line)
            }
          }
          return desiredLines.join('\n')
        }
        function isNodeFrame(stackLine) {
          return stackLine.indexOf('(module.js:') !== -1 || stackLine.indexOf('(node.js:') !== -1
        }
        function captureLine() {
          if (!hasStacks) {
            return
          }
          try {
            throw new Error()
          } catch (e) {
            var lines = e.stack.split('\n');
            var firstLine = lines[0].indexOf('@') > 0 ? lines[1] : lines[2];
            var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
            if (!fileNameAndLineNumber) {
              return
            }
            rFileName = fileNameAndLineNumber[0];
            return fileNameAndLineNumber[1]
          }
        }
        function getFileNameAndLineNumber(stackLine) {
          var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
          if (attempt1) {
            return [
              attempt1[1],
              Number(attempt1[2])
            ]
          }
          var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
          if (attempt2) {
            return [
              attempt2[1],
              Number(attempt2[2])
            ]
          }
          var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
          if (attempt3) {
            return [
              attempt3[1],
              Number(attempt3[2])
            ]
          }
        }
        var EmptyError = Rx.EmptyError = function () {
          this.message = 'Sequence contains no elements.';
          Error.call(this)
        };
        EmptyError.prototype = Object.create(Error.prototype);
        EmptyError.prototype.name = 'EmptyError';
        var ObjectDisposedError = Rx.ObjectDisposedError = function () {
          this.message = 'Object has been disposed';
          Error.call(this)
        };
        ObjectDisposedError.prototype = Object.create(Error.prototype);
        ObjectDisposedError.prototype.name = 'ObjectDisposedError';
        var ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError = function () {
          this.message = 'Argument out of range';
          Error.call(this)
        };
        ArgumentOutOfRangeError.prototype = Object.create(Error.prototype);
        ArgumentOutOfRangeError.prototype.name = 'ArgumentOutOfRangeError';
        var NotSupportedError = Rx.NotSupportedError = function (message) {
          this.message = message || 'This operation is not supported';
          Error.call(this)
        };
        NotSupportedError.prototype = Object.create(Error.prototype);
        NotSupportedError.prototype.name = 'NotSupportedError';
        var NotImplementedError = Rx.NotImplementedError = function (message) {
          this.message = message || 'This operation is not implemented';
          Error.call(this)
        };
        NotImplementedError.prototype = Object.create(Error.prototype);
        NotImplementedError.prototype.name = 'NotImplementedError';
        var notImplemented = Rx.helpers.notImplemented = function () {
          throw new NotImplementedError()
        };
        var notSupported = Rx.helpers.notSupported = function () {
          throw new NotSupportedError()
        };
        var $iterator$ = typeof Symbol === 'function' && Symbol.iterator || '_es6shim_iterator_';
        if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
          $iterator$ = '@@iterator'
        }
        var doneEnumerator = Rx.doneEnumerator = {
          done: true,
          value: undefined
        };
        var isIterable = Rx.helpers.isIterable = function (o) {
          return o && o[$iterator$] !== undefined
        };
        var isArrayLike = Rx.helpers.isArrayLike = function (o) {
          return o && o.length !== undefined
        };
        Rx.helpers.iterator = $iterator$;
        var bindCallback = Rx.internals.bindCallback = function (func, thisArg, argCount) {
          if (typeof thisArg === 'undefined') {
            return func
          }
          switch (argCount) {
          case 0:
            return function () {
              return func.call(thisArg)
            };
          case 1:
            return function (arg) {
              return func.call(thisArg, arg)
            };
          case 2:
            return function (value, index) {
              return func.call(thisArg, value, index)
            };
          case 3:
            return function (value, index, collection) {
              return func.call(thisArg, value, index, collection)
            }
          }
          return function () {
            return func.apply(thisArg, arguments)
          }
        };
        var dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
          ], dontEnumsLength = dontEnums.length;
        var argsTag = '[object Arguments]', arrayTag = '[object Array]', boolTag = '[object Boolean]', dateTag = '[object Date]', errorTag = '[object Error]', funcTag = '[object Function]', mapTag = '[object Map]', numberTag = '[object Number]', objectTag = '[object Object]', regexpTag = '[object RegExp]', setTag = '[object Set]', stringTag = '[object String]', weakMapTag = '[object WeakMap]';
        var arrayBufferTag = '[object ArrayBuffer]', float32Tag = '[object Float32Array]', float64Tag = '[object Float64Array]', int8Tag = '[object Int8Array]', int16Tag = '[object Int16Array]', int32Tag = '[object Int32Array]', uint8Tag = '[object Uint8Array]', uint8ClampedTag = '[object Uint8ClampedArray]', uint16Tag = '[object Uint16Array]', uint32Tag = '[object Uint32Array]';
        var typedArrayTags = {};
        typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
        typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
        var objectProto = Object.prototype, hasOwnProperty = objectProto.hasOwnProperty, objToString = objectProto.toString, MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
        var keys = Object.keys || function () {
          var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !{ toString: null }.propertyIsEnumerable('toString'), dontEnums = [
              'toString',
              'toLocaleString',
              'valueOf',
              'hasOwnProperty',
              'isPrototypeOf',
              'propertyIsEnumerable',
              'constructor'
            ], dontEnumsLength = dontEnums.length;
          return function (obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
              throw new TypeError('Object.keys called on non-object')
            }
            var result = [], prop, i;
            for (prop in obj) {
              if (hasOwnProperty.call(obj, prop)) {
                result.push(prop)
              }
            }
            if (hasDontEnumBug) {
              for (i = 0; i < dontEnumsLength; i++) {
                if (hasOwnProperty.call(obj, dontEnums[i])) {
                  result.push(dontEnums[i])
                }
              }
            }
            return result
          }
        }();
        function equalByTag(object, other, tag) {
          switch (tag) {
          case boolTag:
          case dateTag:
            return +object === +other;
          case errorTag:
            return object.name === other.name && object.message === other.message;
          case numberTag:
            return object !== +object ? other !== +other : object === +other;
          case regexpTag:
          case stringTag:
            return object === other + ''
          }
          return false
        }
        var isObject = Rx.internals.isObject = function (value) {
          var type = typeof value;
          return !!value && (type === 'object' || type === 'function')
        };
        function isLength(value) {
          return typeof value === 'number' && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER
        }
        var isHostObject = function () {
          try {
            Object({ 'toString': 0 } + '')
          } catch (e) {
            return function () {
              return false
            }
          }
          return function (value) {
            return typeof value.toString !== 'function' && typeof (value + '') === 'string'
          }
        }();
        var isArray = Array.isArray || function (value) {
          return isObjectLike(value) && isLength(value.length) && objToString.call(value) === arrayTag
        };
        function equalArrays(array, other, equalFunc, isLoose, stackA, stackB) {
          var index = -1, arrLength = array.length, othLength = other.length;
          if (arrLength !== othLength && !(isLoose && othLength > arrLength)) {
            return false
          }
          while (++index < arrLength) {
            var arrValue = array[index], othValue = other[index], result;
            if (result !== undefined) {
              if (result) {
                continue
              }
              return false
            }
            if (isLoose) {
              if (!arraySome(other, function (othValue) {
                  return arrValue === othValue || equalFunc(arrValue, othValue, isLoose, stackA, stackB)
                })) {
                return false
              }
            } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, isLoose, stackA, stackB))) {
              return false
            }
          }
          return true
        }
        function baseIsEqual(value, other, isLoose, stackA, stackB) {
          if (value === other) {
            return true
          }
          if (value == null || other == null || !isObject(value) && !isObjectLike(other)) {
            return value !== value && other !== other
          }
          return baseIsEqualDeep(value, other, baseIsEqual, isLoose, stackA, stackB)
        }
        var isEqual = Rx.internals.isEqual = function (value, other) {
          return baseIsEqual(value, other)
        };
        var hasProp = {}.hasOwnProperty, slice = Array.prototype.slice;
        var inherits = Rx.internals.inherits = function (child, parent) {
          function __() {
            this.constructor = child
          }
          __.prototype = parent.prototype;
          child.prototype = new __()
        };
        var addProperties = Rx.internals.addProperties = function (obj) {
          for (var sources = [], i = 1, len = arguments.length; i < len; i++) {
            sources.push(arguments[i])
          }
          for (var idx = 0, ln = sources.length; idx < ln; idx++) {
            var source = sources[idx];
            for (var prop in source) {
              obj[prop] = source[prop]
            }
          }
        };
        var addRef = Rx.internals.addRef = function (xs, r) {
          return new AnonymousObservable()
        };
        function arrayInitialize(count, factory) {
          var a = new Array(count);
          for (var i = 0; i < count; i++) {
            a[i] = factory()
          }
          return a
        }
        function IndexedItem(id, value) {
          this.id = id;
          this.value = value
        }
        IndexedItem.prototype.compareTo = function (other) {
          var c = this.value.compareTo(other.value);
          c === 0 && (c = this.id - other.id);
          return c
        };
        var PriorityQueue = Rx.internals.PriorityQueue = function (capacity) {
          this.items = new Array(capacity);
          this.length = 0
        };
        var priorityProto = PriorityQueue.prototype;
        priorityProto.isHigherPriority = function (left, right) {
          return this.items[left].compareTo(this.items[right]) < 0
        };
        priorityProto.percolate = function (index) {
          if (index >= this.length || index < 0) {
            return
          }
          var parent = index - 1 >> 1;
          if (parent < 0 || parent === index) {
            return
          }
          if (this.isHigherPriority(index, parent)) {
            var temp = this.items[index];
            this.items[index] = this.items[parent];
            this.items[parent] = temp;
            this.percolate(parent)
          }
        };
        priorityProto.heapify = function (index) {
          +index || (index = 0);
          if (index >= this.length || index < 0) {
            return
          }
          var left = 2 * index + 1, right = 2 * index + 2, first = index;
          if (left < this.length && this.isHigherPriority(left, first)) {
            first = left
          }
          if (right < this.length && this.isHigherPriority(right, first)) {
            first = right
          }
          if (first !== index) {
            var temp = this.items[index];
            this.items[index] = this.items[first];
            this.items[first] = temp;
            this.heapify(first)
          }
        };
        priorityProto.peek = function () {
          return this.items[0].value
        };
        priorityProto.removeAt = function (index) {
          this.items[index] = this.items[--this.length];
          this.items[this.length] = undefined;
          this.heapify()
        };
        priorityProto.dequeue = function () {
          var result = this.peek();
          this.removeAt(0);
          return result
        };
        priorityProto.enqueue = function (item) {
          var index = this.length++;
          this.items[index] = new IndexedItem(PriorityQueue.count++, item);
          this.percolate(index)
        };
        priorityProto.remove = function (item) {
          for (var i = 0; i < this.length; i++) {
            if (this.items[i].value === item) {
              this.removeAt(i);
              return true
            }
          }
          return false
        };
        PriorityQueue.count = 0;
        var CompositeDisposable = Rx.CompositeDisposable = function () {
          var args = [], i, len;
          if (Array.isArray(arguments[0])) {
            args = arguments[0]
          } else {
            len = arguments.length;
            args = new Array(len);
            for (i = 0; i < len; i++) {
              args[i] = arguments[i]
            }
          }
          this.disposables = args;
          this.isDisposed = false;
          this.length = args.length
        };
        var CompositeDisposablePrototype = CompositeDisposable.prototype;
        CompositeDisposablePrototype.add = function (item) {
          if (this.isDisposed) {
            item.dispose()
          } else {
            this.disposables.push(item);
            this.length++
          }
        };
        CompositeDisposablePrototype.remove = function (item) {
          var shouldDispose = false;
          if (!this.isDisposed) {
            var idx = this.disposables.indexOf(item);
            if (idx !== -1) {
              shouldDispose = true;
              this.disposables.splice(idx, 1);
              this.length--;
              item.dispose()
            }
          }
          return shouldDispose
        };
        CompositeDisposablePrototype.dispose = function () {
          if (!this.isDisposed) {
            this.isDisposed = true;
            var len = this.disposables.length, currentDisposables = new Array(len);
            for (var i = 0; i < len; i++) {
              currentDisposables[i] = this.disposables[i]
            }
            this.disposables = [];
            this.length = 0;
            for (i = 0; i < len; i++) {
              currentDisposables[i].dispose()
            }
          }
        };
        var Disposable = Rx.Disposable = function (action) {
          this.isDisposed = false;
          this.action = action || noop
        };
        Disposable.prototype.dispose = function () {
          if (!this.isDisposed) {
            this.action();
            this.isDisposed = true
          }
        };
        var disposableCreate = Disposable.create = function (action) {
          return new Disposable(action)
        };
        var disposableEmpty = Disposable.empty = { dispose: noop };
        var isDisposable = Disposable.isDisposable = function (d) {
          return d && isFunction(d.dispose)
        };
        var checkDisposed = Disposable.checkDisposed = function (disposable) {
          if (disposable.isDisposed) {
            throw new ObjectDisposedError()
          }
        };
        var disposableFixup = Disposable._fixup = function (result) {
          return isDisposable(result) ? result : disposableEmpty
        };
        var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable = function () {
          this.isDisposed = false;
          this.current = null
        };
        SingleAssignmentDisposable.prototype.getDisposable = function () {
          return this.current
        };
        SingleAssignmentDisposable.prototype.setDisposable = function (value) {
          if (this.current) {
            throw new Error('Disposable has already been assigned')
          }
          var shouldDispose = this.isDisposed;
          !shouldDispose && (this.current = value);
          shouldDispose && value && value.dispose()
        };
        SingleAssignmentDisposable.prototype.dispose = function () {
          if (!this.isDisposed) {
            this.isDisposed = true;
            var old = this.current;
            this.current = null;
            old && old.dispose()
          }
        };
        var SerialDisposable = Rx.SerialDisposable = function () {
          this.isDisposed = false;
          this.current = null
        };
        SerialDisposable.prototype.getDisposable = function () {
          return this.current
        };
        SerialDisposable.prototype.setDisposable = function (value) {
          var shouldDispose = this.isDisposed;
          if (!shouldDispose) {
            var old = this.current;
            this.current = value
          }
          old && old.dispose();
          shouldDispose && value && value.dispose()
        };
        SerialDisposable.prototype.dispose = function () {
          if (!this.isDisposed) {
            this.isDisposed = true;
            var old = this.current;
            this.current = null
          }
          old && old.dispose()
        };
        var BinaryDisposable = Rx.BinaryDisposable = function (first, second) {
          this._first = first;
          this._second = second;
          this.isDisposed = false
        };
        BinaryDisposable.prototype.dispose = function () {
          if (!this.isDisposed) {
            this.isDisposed = true;
            var old1 = this._first;
            this._first = null;
            old1 && old1.dispose();
            var old2 = this._second;
            this._second = null;
            old2 && old2.dispose()
          }
        };
        var NAryDisposable = Rx.NAryDisposable = function (disposables) {
          this._disposables = disposables;
          this.isDisposed = false
        };
        NAryDisposable.prototype.dispose = function () {
          if (!this.isDisposed) {
            this.isDisposed = true;
            for (var i = 0, len = this._disposables.length; i < len; i++) {
              this._disposables[i].dispose()
            }
            this._disposables.length = 0
          }
        };
        var RefCountDisposable = Rx.RefCountDisposable = function () {
          function InnerDisposable(disposable) {
            this.disposable = disposable;
            this.disposable.count++;
            this.isInnerDisposed = false
          }
          function RefCountDisposable(disposable) {
            this.underlyingDisposable = disposable;
            this.isDisposed = false;
            this.isPrimaryDisposed = false;
            this.count = 0
          }
          return RefCountDisposable
        }();
        function ScheduledDisposable(scheduler, disposable) {
          this.scheduler = scheduler;
          this.disposable = disposable;
          this.isDisposed = false
        }
        ScheduledDisposable.prototype.dispose = function () {
          this.scheduler.schedule(this, scheduleItem)
        };
        var ScheduledItem = Rx.internals.ScheduledItem = function (scheduler, state, action, dueTime, comparer) {
          this.scheduler = scheduler;
          this.state = state;
          this.action = action;
          this.dueTime = dueTime;
          this.comparer = comparer || defaultSubComparer;
          this.disposable = new SingleAssignmentDisposable()
        };
        ScheduledItem.prototype.invoke = function () {
          this.disposable.setDisposable(this.invokeCore())
        };
        ScheduledItem.prototype.compareTo = function (other) {
          return this.comparer(this.dueTime, other.dueTime)
        };
        ScheduledItem.prototype.isCancelled = function () {
          return this.disposable.isDisposed
        };
        ScheduledItem.prototype.invokeCore = function () {
          return disposableFixup(this.action(this.scheduler, this.state))
        };
        var Scheduler = Rx.Scheduler = function () {
          function Scheduler() {
          }
          Scheduler.isScheduler = function (s) {
            return s instanceof Scheduler
          };
          var schedulerProto = Scheduler.prototype;
          schedulerProto.schedule = function (state, action) {
            throw new NotImplementedError()
          };
          schedulerProto.scheduleFuture = function (state, dueTime, action) {
            var dt = dueTime;
            dt instanceof Date && (dt = dt - this.now());
            dt = Scheduler.normalize(dt);
            if (dt === 0) {
              return this.schedule(state, action)
            }
            return this._scheduleFuture(state, dt, action)
          };
          schedulerProto._scheduleFuture = function (state, dueTime, action) {
            throw new NotImplementedError()
          };
          Scheduler.now = defaultNow;
          Scheduler.prototype.now = defaultNow;
          Scheduler.normalize = function (timeSpan) {
            timeSpan < 0 && (timeSpan = 0);
            return timeSpan
          };
          return Scheduler
        }();
        var normalizeTime = Scheduler.normalize, isScheduler = Scheduler.isScheduler;
        (function (schedulerProto) {
          function invokeRecImmediate(scheduler, pair) {
            var state = pair[0], action = pair[1], group = new CompositeDisposable();
            action(state, innerAction);
            return group;
            function innerAction(state2) {
              var isAdded = false, isDone = false;
              var d = scheduler.schedule(state2, scheduleWork);
              if (!isDone) {
                group.add(d);
                isAdded = true
              }
              function scheduleWork(_, state3) {
                if (isAdded) {
                  group.remove(d)
                } else {
                  isDone = true
                }
                action(state3, innerAction);
                return disposableEmpty
              }
            }
          }
          schedulerProto.scheduleRecursive = function (state, action) {
            return this.schedule([
              state,
              action
            ], invokeRecImmediate)
          };
          schedulerProto.scheduleRecursiveFuture = function (state, dueTime, action) {
            return this.scheduleFuture([
              state,
              action
            ], dueTime, invokeRecDate)
          }
        }(Scheduler.prototype));
        (function (schedulerProto) {
          schedulerProto.schedulePeriodic = function (state, period, action) {
            if (typeof root.setInterval === 'undefined') {
              throw new NotSupportedError()
            }
            period = normalizeTime(period);
            var s = state, id = root.setInterval(period);
            return disposableCreate()
          }
        }(Scheduler.prototype));
        (function (schedulerProto) {
          schedulerProto.catchError = schedulerProto['catch'] = function (handler) {
            return new CatchScheduler(this, handler)
          }
        }(Scheduler.prototype));
        var SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive = function () {
          function SchedulePeriodicRecursive(scheduler, state, period, action) {
            this._scheduler = scheduler;
            this._state = state;
            this._period = period;
            this._action = action
          }
          return SchedulePeriodicRecursive
        }();
        var ImmediateScheduler = function (__super__) {
          inherits(ImmediateScheduler, __super__);
          function ImmediateScheduler() {
            __super__.call(this)
          }
          ImmediateScheduler.prototype.schedule = function (state, action) {
            return disposableFixup(action(this, state))
          };
          return ImmediateScheduler
        }(Scheduler);
        var immediateScheduler = Scheduler.immediate = new ImmediateScheduler();
        var CurrentThreadScheduler = function (__super__) {
          var queue;
          function runTrampoline() {
            while (queue.length > 0) {
              var item = queue.dequeue();
              !item.isCancelled() && item.invoke()
            }
          }
          inherits(CurrentThreadScheduler, __super__);
          function CurrentThreadScheduler() {
            __super__.call(this)
          }
          CurrentThreadScheduler.prototype.schedule = function (state, action) {
            var si = new ScheduledItem(this, state, action, this.now());
            if (!queue) {
              queue = new PriorityQueue(4);
              queue.enqueue(si);
              var result = tryCatch(runTrampoline)();
              queue = null;
              if (result === errorObj) {
                thrower(result.e)
              }
            } else {
              queue.enqueue(si)
            }
            return si.disposable
          };
          CurrentThreadScheduler.prototype.scheduleRequired = function () {
            return !queue
          };
          return CurrentThreadScheduler
        }(Scheduler);
        var currentThreadScheduler = Scheduler.currentThread = new CurrentThreadScheduler();
        var scheduleMethod, clearMethod;
        var localTimer = function () {
          var localSetTimeout, localClearTimeout = noop;
          if (!!root.setTimeout) {
            localSetTimeout = root.setTimeout;
            localClearTimeout = root.clearTimeout
          } else if (!!root.WScript) {
            localSetTimeout = function (fn, time) {
              root.WScript.Sleep(time);
              fn()
            }
          } else {
            throw new NotSupportedError()
          }
          return {
            setTimeout: localSetTimeout,
            clearTimeout: localClearTimeout
          }
        }();
        var localSetTimeout = localTimer.setTimeout, localClearTimeout = localTimer.clearTimeout;
        (function () {
          var nextHandle = 1, tasksByHandle = {}, currentlyRunning = false;
          clearMethod = function (handle) {
            delete tasksByHandle[handle]
          };
          var reNative = new RegExp('^' + String(toString).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/toString| for [^\]]+/g, '.*?') + '$');
          var setImmediate = typeof (setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' && !reNative.test(setImmediate) && setImmediate;
          function postMessageSupported() {
            if (!root.postMessage || root.importScripts) {
              return false
            }
            var isAsync = false, oldHandler = root.onmessage;
            root.onmessage = function () {
              isAsync = true
            };
            root.postMessage('', '*');
            root.onmessage = oldHandler;
            return isAsync
          }
          if (isFunction(setImmediate)) {
            scheduleMethod = function (action) {
              var id = nextHandle++;
              tasksByHandle[id] = action;
              setImmediate(function () {
                runTask(id)
              });
              return id
            }
          } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
            scheduleMethod = function (action) {
              var id = nextHandle++;
              tasksByHandle[id] = action;
              process.nextTick(function () {
                runTask(id)
              });
              return id
            }
          } else if (postMessageSupported()) {
            var MSG_PREFIX = 'ms.rx.schedule' + Math.random();
            var onGlobalPostMessage = function (event) {
              if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
                runTask(event.data.substring(MSG_PREFIX.length))
              }
            };
            root.addEventListener('message', onGlobalPostMessage, false);
            scheduleMethod = function (action) {
              var id = nextHandle++;
              tasksByHandle[id] = action;
              root.postMessage(MSG_PREFIX + id, '*');
              return id
            }
          } else if (!!root.MessageChannel) {
            var channel = new root.MessageChannel();
            channel.port1.onmessage = function (e) {
              runTask(e.data)
            };
            scheduleMethod = function (action) {
              var id = nextHandle++;
              tasksByHandle[id] = action;
              channel.port2.postMessage(id);
              return id
            }
          } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {
            scheduleMethod = function (action) {
              var scriptElement = root.document.createElement('script');
              var id = nextHandle++;
              tasksByHandle[id] = action;
              scriptElement.onreadystatechange = function () {
                runTask(id);
                scriptElement.onreadystatechange = null;
                scriptElement.parentNode.removeChild(scriptElement);
                scriptElement = null
              };
              root.document.documentElement.appendChild(scriptElement);
              return id
            }
          } else {
            scheduleMethod = function (action) {
              var id = nextHandle++;
              tasksByHandle[id] = action;
              localSetTimeout(function () {
                runTask(id)
              }, 0);
              return id
            }
          }
        }());
        var DefaultScheduler = function (__super__) {
          inherits(DefaultScheduler, __super__);
          function DefaultScheduler() {
            __super__.call(this)
          }
          function ClearDisposable(id) {
            this._id = id;
            this.isDisposed = false
          }
          function LocalClearDisposable(id) {
            this._id = id;
            this.isDisposed = false
          }
          DefaultScheduler.prototype.schedule = function (state, action) {
            var disposable = new SingleAssignmentDisposable(), id = scheduleMethod(scheduleAction(disposable, action, this, state));
            return new BinaryDisposable(disposable, new ClearDisposable(id))
          };
          DefaultScheduler.prototype._scheduleFuture = function (state, dueTime, action) {
            if (dueTime === 0) {
              return this.schedule(state, action)
            }
            var disposable = new SingleAssignmentDisposable(), id = localSetTimeout(scheduleAction(disposable, action, this, state), dueTime);
            return new BinaryDisposable(disposable, new LocalClearDisposable(id))
          };
          DefaultScheduler.prototype.scheduleLongRunning = function (state, action) {
            var disposable = disposableCreate(noop);
            scheduleMethod(scheduleLongRunning(state, action, disposable));
            return disposable
          };
          return DefaultScheduler
        }(Scheduler);
        var defaultScheduler = Scheduler['default'] = Scheduler.async = new DefaultScheduler();
        var CatchScheduler = function (__super__) {
          inherits(CatchScheduler, __super__);
          function CatchScheduler(scheduler, handler) {
            this._scheduler = scheduler;
            this._handler = handler;
            this._recursiveOriginal = null;
            this._recursiveWrapper = null;
            __super__.call(this)
          }
          CatchScheduler.prototype._clone = function (scheduler) {
            return new CatchScheduler(scheduler, this._handler)
          };
          return CatchScheduler
        }(Scheduler);
        var Notification = Rx.Notification = function () {
          function Notification() {
          }
          Notification.prototype.toObservable = function (scheduler) {
            var self = this;
            isScheduler(scheduler) || (scheduler = immediateScheduler);
            return new AnonymousObservable(function (o) {
              return scheduler.schedule(self, function (_, notification) {
                notification._acceptObserver(o);
                notification.kind === 'N' && o.onCompleted()
              })
            })
          };
          return Notification
        }();
        var OnNextNotification = function (__super__) {
          inherits(OnNextNotification, __super__);
          function OnNextNotification(value) {
            this.value = value;
            this.kind = 'N'
          }
          return OnNextNotification
        }(Notification);
        var OnErrorNotification = function (__super__) {
          inherits(OnErrorNotification, __super__);
          function OnErrorNotification(error) {
            this.error = error;
            this.kind = 'E'
          }
          return OnErrorNotification
        }(Notification);
        var OnCompletedNotification = function (__super__) {
          inherits(OnCompletedNotification, __super__);
          function OnCompletedNotification() {
            this.kind = 'C'
          }
          return OnCompletedNotification
        }(Notification);
        var notificationCreateOnNext = Notification.createOnNext = function (value) {
          return new OnNextNotification(value)
        };
        var notificationCreateOnError = Notification.createOnError = function (error) {
          return new OnErrorNotification(error)
        };
        var notificationCreateOnCompleted = Notification.createOnCompleted = function () {
          return new OnCompletedNotification()
        };
        var Observer = Rx.Observer = function () {
        };
        Observer.prototype.toNotifier = function () {
          var observer = this;
          return function (n) {
            return n.accept(observer)
          }
        };
        Observer.prototype.asObserver = function () {
          var self = this;
          return new AnonymousObserver(function (x) {
            self.onNext(x)
          }, function () {
            self.onCompleted()
          })
        };
        Observer.prototype.checked = function () {
          return new CheckedObserver(this)
        };
        var observerCreate = Observer.create = function (onNext, onError, onCompleted) {
          onNext || (onNext = noop);
          onError || (onError = defaultError);
          onCompleted || (onCompleted = noop);
          return new AnonymousObserver(onNext, onError, onCompleted)
        };
        Observer.fromNotifier = function (handler, thisArg) {
          var cb = bindCallback(handler, thisArg, 1);
          return new AnonymousObserver(function (e) {
            return cb(notificationCreateOnError(e))
          })
        };
        Observer.prototype.notifyOn = function (scheduler) {
          return new ObserveOnObserver(scheduler, this)
        };
        Observer.prototype.makeSafe = function (disposable) {
          return new AnonymousSafeObserver(this._onNext, this._onError, this._onCompleted, disposable)
        };
        var AbstractObserver = Rx.internals.AbstractObserver = function (__super__) {
          inherits(AbstractObserver, __super__);
          function AbstractObserver() {
            this.isStopped = false
          }
          AbstractObserver.prototype.next = notImplemented;
          AbstractObserver.prototype.error = notImplemented;
          AbstractObserver.prototype.completed = notImplemented;
          AbstractObserver.prototype.onNext = function (value) {
            !this.isStopped && this.next(value)
          };
          AbstractObserver.prototype.onError = function (error) {
            if (!this.isStopped) {
              this.isStopped = true;
              this.error(error)
            }
          };
          AbstractObserver.prototype.onCompleted = function () {
            if (!this.isStopped) {
              this.isStopped = true;
              this.completed()
            }
          };
          AbstractObserver.prototype.dispose = function () {
            this.isStopped = true
          };
          AbstractObserver.prototype.fail = function (e) {
            if (!this.isStopped) {
              this.isStopped = true;
              this.error(e);
              return true
            }
            return false
          };
          return AbstractObserver
        }(Observer);
        var AnonymousObserver = Rx.AnonymousObserver = function (__super__) {
          inherits(AnonymousObserver, __super__);
          function AnonymousObserver(onNext, onError, onCompleted) {
            __super__.call(this);
            this._onNext = onNext;
            this._onError = onError;
            this._onCompleted = onCompleted
          }
          AnonymousObserver.prototype.next = function (value) {
            this._onNext(value)
          };
          AnonymousObserver.prototype.error = function (error) {
            this._onError(error)
          };
          AnonymousObserver.prototype.completed = function () {
            this._onCompleted()
          };
          return AnonymousObserver
        }(AbstractObserver);
        var CheckedObserver = function (__super__) {
          inherits(CheckedObserver, __super__);
          function CheckedObserver(observer) {
            __super__.call(this);
            this._observer = observer;
            this._state = 0
          }
          var CheckedObserverPrototype = CheckedObserver.prototype;
          CheckedObserverPrototype.onNext = function (value) {
            this.checkAccess();
            var res = tryCatch(this._observer.onNext).call(this._observer, value);
            this._state = 0;
            res === errorObj && thrower(res.e)
          };
          CheckedObserverPrototype.onError = function (err) {
            this.checkAccess();
            var res = tryCatch(this._observer.onError).call(this._observer, err);
            this._state = 2;
            res === errorObj && thrower(res.e)
          };
          CheckedObserverPrototype.onCompleted = function () {
            this.checkAccess();
            var res = tryCatch(this._observer.onCompleted).call(this._observer);
            this._state = 2;
            res === errorObj && thrower(res.e)
          };
          CheckedObserverPrototype.checkAccess = function () {
            if (this._state === 1) {
              throw new Error('Re-entrancy detected')
            }
            if (this._state === 2) {
              throw new Error('Observer completed')
            }
            if (this._state === 0) {
              this._state = 1
            }
          };
          return CheckedObserver
        }(Observer);
        var ScheduledObserver = Rx.internals.ScheduledObserver = function (__super__) {
          inherits(ScheduledObserver, __super__);
          function ScheduledObserver(scheduler, observer) {
            __super__.call(this);
            this.scheduler = scheduler;
            this.observer = observer;
            this.isAcquired = false;
            this.hasFaulted = false;
            this.queue = [];
            this.disposable = new SerialDisposable()
          }
          function enqueueNext(observer, x) {
            return function () {
              observer.onNext(x)
            }
          }
          ScheduledObserver.prototype.next = function (x) {
            this.queue.push(enqueueNext(this.observer, x))
          };
          ScheduledObserver.prototype.error = function (e) {
            this.queue.push(enqueueError(this.observer, e))
          };
          ScheduledObserver.prototype.completed = function () {
            this.queue.push(enqueueCompleted(this.observer))
          };
          function scheduleMethod(state, recurse) {
            var work;
            if (state.queue.length > 0) {
              work = state.queue.shift()
            } else {
              state.isAcquired = false;
              return
            }
            var res = tryCatch(work)();
            if (res === errorObj) {
              state.queue = [];
              state.hasFaulted = true;
              return thrower(res.e)
            }
            recurse(state)
          }
          ScheduledObserver.prototype.ensureActive = function () {
            var isOwner = false;
            if (!this.hasFaulted && this.queue.length > 0) {
              isOwner = !this.isAcquired;
              this.isAcquired = true
            }
            isOwner && this.disposable.setDisposable(this.scheduler.scheduleRecursive(this, scheduleMethod))
          };
          ScheduledObserver.prototype.dispose = function () {
            __super__.prototype.dispose.call(this);
            this.disposable.dispose()
          };
          return ScheduledObserver
        }(AbstractObserver);
        var ObserveOnObserver = function (__super__) {
          inherits(ObserveOnObserver, __super__);
          function ObserveOnObserver(scheduler, observer, cancel) {
            __super__.call(this, scheduler, observer);
            this._cancel = cancel
          }
          ObserveOnObserver.prototype.dispose = function () {
            __super__.prototype.dispose.call(this);
            this._cancel && this._cancel.dispose();
            this._cancel = null
          };
          return ObserveOnObserver
        }(ScheduledObserver);
        var observableProto;
        var Observable = Rx.Observable = function () {
          function Observable() {
            if (Rx.config.longStackSupport && hasStacks) {
              var oldSubscribe = this._subscribe;
              var e = tryCatch(thrower)(new Error()).e;
              this.stack = e.stack.substring(e.stack.indexOf('\n') + 1);
              this._subscribe = makeSubscribe(this, oldSubscribe)
            }
          }
          observableProto = Observable.prototype;
          Observable.isObservable = function (o) {
            return o && isFunction(o.subscribe)
          };
          observableProto.subscribe = observableProto.forEach = function (oOrOnNext, onError, onCompleted) {
            return this._subscribe(typeof oOrOnNext === 'object' ? oOrOnNext : observerCreate(oOrOnNext, onError, onCompleted))
          };
          observableProto.subscribeOnNext = function (onNext, thisArg) {
            return this._subscribe(observerCreate(typeof thisArg !== 'undefined' ? function (x) {
              onNext.call(thisArg, x)
            } : onNext))
          };
          observableProto.subscribeOnError = function (onError, thisArg) {
            return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined' ? function (e) {
              onError.call(thisArg, e)
            } : onError))
          };
          observableProto.subscribeOnCompleted = function (onCompleted, thisArg) {
            return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined' ? function () {
              onCompleted.call(thisArg)
            } : onCompleted))
          };
          return Observable
        }();
        var ObservableBase = Rx.ObservableBase = function (__super__) {
          inherits(ObservableBase, __super__);
          function fixSubscriber(subscriber) {
            return subscriber && isFunction(subscriber.dispose) ? subscriber : isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty
          }
          function setDisposable(s, state) {
            var ado = state[0], self = state[1];
            var sub = tryCatch(self.subscribeCore).call(self, ado);
            if (sub === errorObj && !ado.fail(errorObj.e)) {
              thrower(errorObj.e)
            }
            ado.setDisposable(fixSubscriber(sub))
          }
          function ObservableBase() {
            __super__.call(this)
          }
          ObservableBase.prototype._subscribe = function (o) {
            var ado = new AutoDetachObserver(o), state = [
                ado,
                this
              ];
            if (currentThreadScheduler.scheduleRequired()) {
              currentThreadScheduler.schedule(state, setDisposable)
            } else {
              setDisposable(null, state)
            }
            return ado
          };
          ObservableBase.prototype.subscribeCore = notImplemented;
          return ObservableBase
        }(Observable);
        var FlatMapObservable = Rx.FlatMapObservable = function (__super__) {
          inherits(FlatMapObservable, __super__);
          function FlatMapObservable(source, selector, resultSelector, thisArg) {
            this.resultSelector = isFunction(resultSelector) ? resultSelector : null;
            this.selector = bindCallback(isFunction(selector) ? selector : function () {
              return selector
            }, thisArg, 3);
            this.source = source;
            __super__.call(this)
          }
          FlatMapObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new InnerObserver(o, this.selector, this.resultSelector, this))
          };
          inherits(InnerObserver, AbstractObserver);
          function InnerObserver(observer, selector, resultSelector, source) {
            this.i = 0;
            this.selector = selector;
            this.resultSelector = resultSelector;
            this.source = source;
            this.o = observer;
            AbstractObserver.call(this)
          }
          InnerObserver.prototype._wrapResult = function (result, x, i) {
            return this.resultSelector ? result.map(function (y, i2) {
              return this.resultSelector(x, y, i, i2)
            }, this) : result
          };
          InnerObserver.prototype.next = function (x) {
            var i = this.i++;
            var result = tryCatch(this.selector)(x, i, this.source);
            if (result === errorObj) {
              return this.o.onError(result.e)
            }
            isPromise(result) && (result = observableFromPromise(result));
            (isArrayLike(result) || isIterable(result)) && (result = Observable.from(result));
            this.o.onNext(this._wrapResult(result, x, i))
          };
          InnerObserver.prototype.error = function (e) {
            this.o.onError(e)
          };
          InnerObserver.prototype.completed = function () {
            this.o.onCompleted()
          };
          return FlatMapObservable
        }(ObservableBase);
        var Enumerable = Rx.internals.Enumerable = function () {
        };
        function IsDisposedDisposable(state) {
          this._s = state;
          this.isDisposed = false
        }
        var ConcatEnumerableObservable = function (__super__) {
          inherits(ConcatEnumerableObservable, __super__);
          function ConcatEnumerableObservable(sources) {
            this.sources = sources;
            __super__.call(this)
          }
          function scheduleMethod(state, recurse) {
            if (state.isDisposed) {
              return
            }
            var currentItem = tryCatch(state.e.next).call(state.e);
            if (currentItem === errorObj) {
              return state.o.onError(currentItem.e)
            }
            if (currentItem.done) {
              return state.o.onCompleted()
            }
            var currentValue = currentItem.value;
            isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
            var d = new SingleAssignmentDisposable();
            state.subscription.setDisposable(d);
            d.setDisposable(currentValue.subscribe(new InnerObserver(state, recurse)))
          }
          ConcatEnumerableObservable.prototype.subscribeCore = function (o) {
            var subscription = new SerialDisposable();
            var state = {
              isDisposed: false,
              o: o,
              subscription: subscription,
              e: this.sources[$iterator$]()
            };
            var cancelable = currentThreadScheduler.scheduleRecursive(state, scheduleMethod);
            return new NAryDisposable([
              subscription,
              cancelable,
              new IsDisposedDisposable(state)
            ])
          };
          function InnerObserver(state, recurse) {
            this._state = state;
            this._recurse = recurse;
            AbstractObserver.call(this)
          }
          inherits(InnerObserver, AbstractObserver);
          InnerObserver.prototype.next = function (x) {
            this._state.o.onNext(x)
          };
          InnerObserver.prototype.error = function (e) {
            this._state.o.onError(e)
          };
          InnerObserver.prototype.completed = function () {
            this._recurse(this._state)
          };
          return ConcatEnumerableObservable
        }(ObservableBase);
        Enumerable.prototype.concat = function () {
          return new ConcatEnumerableObservable(this)
        };
        var CatchErrorObservable = function (__super__) {
          function CatchErrorObservable(sources) {
            this.sources = sources;
            __super__.call(this)
          }
          inherits(CatchErrorObservable, __super__);
          function InnerObserver(state, recurse) {
            this._state = state;
            this._recurse = recurse;
            AbstractObserver.call(this)
          }
          inherits(InnerObserver, AbstractObserver);
          InnerObserver.prototype.next = function (x) {
            this._state.o.onNext(x)
          };
          InnerObserver.prototype.error = function (e) {
            this._state.lastError = e;
            this._recurse(this._state)
          };
          InnerObserver.prototype.completed = function () {
            this._state.o.onCompleted()
          };
          return CatchErrorObservable
        }(ObservableBase);
        Enumerable.prototype.catchError = function () {
          return new CatchErrorObservable(this)
        };
        var RepeatEnumerable = function (__super__) {
          inherits(RepeatEnumerable, __super__);
          function RepeatEnumerable(v, c) {
            this.v = v;
            this.c = c == null ? -1 : c
          }
          function RepeatEnumerator(p) {
            this.v = p.v;
            this.l = p.c
          }
          return RepeatEnumerable
        }(Enumerable);
        var enumerableRepeat = Enumerable.repeat = function (value, repeatCount) {
          return new RepeatEnumerable(value, repeatCount)
        };
        var OfEnumerable = function (__super__) {
          inherits(OfEnumerable, __super__);
          function OfEnumerable(s, fn, thisArg) {
            this.s = s;
            this.fn = fn ? bindCallback(fn, thisArg, 3) : null
          }
          function OfEnumerator(p) {
            this.i = -1;
            this.s = p.s;
            this.l = this.s.length;
            this.fn = p.fn
          }
          return OfEnumerable
        }(Enumerable);
        var enumerableOf = Enumerable.of = function (source, selector, thisArg) {
          return new OfEnumerable(source, selector, thisArg)
        };
        var ObserveOnObservable = function (__super__) {
          inherits(ObserveOnObservable, __super__);
          function ObserveOnObservable(source, s) {
            this.source = source;
            this._s = s;
            __super__.call(this)
          }
          return ObserveOnObservable
        }(ObservableBase);
        observableProto.observeOn = function (scheduler) {
          return new ObserveOnObservable(this, scheduler)
        };
        var SubscribeOnObservable = function (__super__) {
          inherits(SubscribeOnObservable, __super__);
          function SubscribeOnObservable(source, s) {
            this.source = source;
            this._s = s;
            __super__.call(this)
          }
          return SubscribeOnObservable
        }(ObservableBase);
        observableProto.subscribeOn = function (scheduler) {
          return new SubscribeOnObservable(this, scheduler)
        };
        var FromPromiseObservable = function (__super__) {
          inherits(FromPromiseObservable, __super__);
          function FromPromiseObservable(p, s) {
            this._p = p;
            this._s = s;
            __super__.call(this)
          }
          return FromPromiseObservable
        }(ObservableBase);
        var observableFromPromise = Observable.fromPromise = function (promise, scheduler) {
          scheduler || (scheduler = defaultScheduler);
          return new FromPromiseObservable(promise, scheduler)
        };
        observableProto.toPromise = function (promiseCtor) {
          promiseCtor || (promiseCtor = Rx.config.Promise);
          if (!promiseCtor) {
            throw new NotSupportedError('Promise type not provided nor in Rx.config.Promise')
          }
          var source = this;
          return new promiseCtor()
        };
        var ToArrayObservable = function (__super__) {
          inherits(ToArrayObservable, __super__);
          function ToArrayObservable(source) {
            this.source = source;
            __super__.call(this)
          }
          inherits(InnerObserver, AbstractObserver);
          function InnerObserver(o) {
            this.o = o;
            this.a = [];
            AbstractObserver.call(this)
          }
          InnerObserver.prototype.next = function (x) {
            this.a.push(x)
          };
          InnerObserver.prototype.error = function (e) {
            this.o.onError(e)
          };
          InnerObserver.prototype.completed = function () {
            this.o.onNext(this.a);
            this.o.onCompleted()
          };
          return ToArrayObservable
        }(ObservableBase);
        observableProto.toArray = function () {
          return new ToArrayObservable(this)
        };
        Observable.create = function (subscribe, parent) {
          return new AnonymousObservable(subscribe, parent)
        };
        var Defer = function (__super__) {
          inherits(Defer, __super__);
          function Defer(factory) {
            this._f = factory;
            __super__.call(this)
          }
          return Defer
        }(ObservableBase);
        var observableDefer = Observable.defer = function (observableFactory) {
          return new Defer(observableFactory)
        };
        var EmptyObservable = function (__super__) {
          inherits(EmptyObservable, __super__);
          function EmptyObservable(scheduler) {
            this.scheduler = scheduler;
            __super__.call(this)
          }
          EmptyObservable.prototype.subscribeCore = function (observer) {
            var sink = new EmptySink(observer, this.scheduler);
            return sink.run()
          };
          function EmptySink(observer, scheduler) {
            this.observer = observer;
            this.scheduler = scheduler
          }
          return EmptyObservable
        }(ObservableBase);
        var EMPTY_OBSERVABLE = new EmptyObservable(immediateScheduler);
        var observableEmpty = Observable.empty = function (scheduler) {
          isScheduler(scheduler) || (scheduler = immediateScheduler);
          return scheduler === immediateScheduler ? EMPTY_OBSERVABLE : new EmptyObservable(scheduler)
        };
        var FromObservable = function (__super__) {
          inherits(FromObservable, __super__);
          function FromObservable(iterable, fn, scheduler) {
            this._iterable = iterable;
            this._fn = fn;
            this._scheduler = scheduler;
            __super__.call(this)
          }
          return FromObservable
        }(ObservableBase);
        var maxSafeInteger = Math.pow(2, 53) - 1;
        function StringIterable(s) {
          this._s = s
        }
        function StringIterator(s) {
          this._s = s;
          this._l = s.length;
          this._i = 0
        }
        StringIterator.prototype.next = function () {
          return this._i < this._l ? {
            done: false,
            value: this._s.charAt(this._i++)
          } : doneEnumerator
        };
        function ArrayIterable(a) {
          this._a = a
        }
        function ArrayIterator(a) {
          this._a = a;
          this._l = toLength(a);
          this._i = 0
        }
        ArrayIterator.prototype.next = function () {
          return this._i < this._l ? {
            done: false,
            value: this._a[this._i++]
          } : doneEnumerator
        };
        function isNan(n) {
          return n !== n
        }
        function sign(value) {
          var number = +value;
          if (number === 0) {
            return number
          }
          if (isNaN(number)) {
            return number
          }
          return number < 0 ? -1 : 1
        }
        var observableFrom = Observable.from = function (iterable, mapFn, thisArg, scheduler) {
          if (iterable == null) {
            throw new Error('iterable cannot be null.')
          }
          if (mapFn && !isFunction(mapFn)) {
            throw new Error('mapFn when provided must be a function')
          }
          if (mapFn) {
            var mapper = bindCallback(mapFn, thisArg, 2)
          }
          isScheduler(scheduler) || (scheduler = currentThreadScheduler);
          return new FromObservable(iterable, mapper, scheduler)
        };
        var FromArrayObservable = function (__super__) {
          inherits(FromArrayObservable, __super__);
          function FromArrayObservable(args, scheduler) {
            this._args = args;
            this._scheduler = scheduler;
            __super__.call(this)
          }
          function scheduleMethod(o, args) {
            var len = args.length;
            return function loopRecursive(i, recurse) {
              if (i < len) {
                o.onNext(args[i]);
                recurse(i + 1)
              } else {
                o.onCompleted()
              }
            }
          }
          FromArrayObservable.prototype.subscribeCore = function (o) {
            return this._scheduler.scheduleRecursive(0, scheduleMethod(o, this._args))
          };
          return FromArrayObservable
        }(ObservableBase);
        var observableFromArray = Observable.fromArray = function (array, scheduler) {
          isScheduler(scheduler) || (scheduler = currentThreadScheduler);
          return new FromArrayObservable(array, scheduler)
        };
        var GenerateObservable = function (__super__) {
          inherits(GenerateObservable, __super__);
          function GenerateObservable(state, cndFn, itrFn, resFn, s) {
            this._initialState = state;
            this._cndFn = cndFn;
            this._itrFn = itrFn;
            this._resFn = resFn;
            this._s = s;
            __super__.call(this)
          }
          return GenerateObservable
        }(ObservableBase);
        Observable.generate = function (initialState, condition, iterate, resultSelector, scheduler) {
          isScheduler(scheduler) || (scheduler = currentThreadScheduler);
          return new GenerateObservable(initialState, condition, iterate, resultSelector, scheduler)
        };
        function observableOf(scheduler, array) {
          isScheduler(scheduler) || (scheduler = currentThreadScheduler);
          return new FromArrayObservable(array, scheduler)
        }
        Observable.of = function () {
          var len = arguments.length, args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          return new FromArrayObservable(args, currentThreadScheduler)
        };
        Observable.ofWithScheduler = function (scheduler) {
          var len = arguments.length, args = new Array(len - 1);
          for (var i = 1; i < len; i++) {
            args[i - 1] = arguments[i]
          }
          return new FromArrayObservable(args, scheduler)
        };
        Observable.ofArrayChanges = function (array) {
          if (!Array.isArray(array)) {
            throw new TypeError('Array.observe only accepts arrays.')
          }
          if (typeof Array.observe !== 'function' && typeof Array.unobserve !== 'function') {
            throw new TypeError('Array.observe is not supported on your platform')
          }
          return new AnonymousObservable()
        };
        Observable.ofObjectChanges = function (obj) {
          if (obj == null) {
            throw new TypeError('object must not be null or undefined.')
          }
          if (typeof Object.observe !== 'function' && typeof Object.unobserve !== 'function') {
            throw new TypeError('Object.observe is not supported on your platform')
          }
          return new AnonymousObservable()
        };
        var NeverObservable = function (__super__) {
          inherits(NeverObservable, __super__);
          function NeverObservable() {
            __super__.call(this)
          }
          NeverObservable.prototype.subscribeCore = function (observer) {
            return disposableEmpty
          };
          return NeverObservable
        }(ObservableBase);
        var NEVER_OBSERVABLE = new NeverObservable();
        var observableNever = Observable.never = function () {
          return NEVER_OBSERVABLE
        };
        var PairsObservable = function (__super__) {
          inherits(PairsObservable, __super__);
          function PairsObservable(o, scheduler) {
            this._o = o;
            this._keys = Object.keys(o);
            this._scheduler = scheduler;
            __super__.call(this)
          }
          return PairsObservable
        }(ObservableBase);
        Observable.pairs = function (obj, scheduler) {
          scheduler || (scheduler = currentThreadScheduler);
          return new PairsObservable(obj, scheduler)
        };
        var RangeObservable = function (__super__) {
          inherits(RangeObservable, __super__);
          function RangeObservable(start, count, scheduler) {
            this.start = start;
            this.rangeCount = count;
            this.scheduler = scheduler;
            __super__.call(this)
          }
          return RangeObservable
        }(ObservableBase);
        Observable.range = function (start, count, scheduler) {
          isScheduler(scheduler) || (scheduler = currentThreadScheduler);
          return new RangeObservable(start, count, scheduler)
        };
        var RepeatObservable = function (__super__) {
          inherits(RepeatObservable, __super__);
          function RepeatObservable(value, repeatCount, scheduler) {
            this.value = value;
            this.repeatCount = repeatCount == null ? -1 : repeatCount;
            this.scheduler = scheduler;
            __super__.call(this)
          }
          return RepeatObservable
        }(ObservableBase);
        function RepeatSink(observer, parent) {
          this.observer = observer;
          this.parent = parent
        }
        Observable.repeat = function (value, repeatCount, scheduler) {
          isScheduler(scheduler) || (scheduler = currentThreadScheduler);
          return new RepeatObservable(value, repeatCount, scheduler)
        };
        var JustObservable = function (__super__) {
          inherits(JustObservable, __super__);
          function JustObservable(value, scheduler) {
            this._value = value;
            this._scheduler = scheduler;
            __super__.call(this)
          }
          JustObservable.prototype.subscribeCore = function (o) {
            var state = [
              this._value,
              o
            ];
            return this._scheduler === immediateScheduler ? scheduleItem(null, state) : this._scheduler.schedule(state, scheduleItem)
          };
          function scheduleItem(s, state) {
            var value = state[0], observer = state[1];
            observer.onNext(value);
            observer.onCompleted();
            return disposableEmpty
          }
          return JustObservable
        }(ObservableBase);
        var observableReturn = Observable['return'] = Observable.just = function (value, scheduler) {
          isScheduler(scheduler) || (scheduler = immediateScheduler);
          return new JustObservable(value, scheduler)
        };
        var ThrowObservable = function (__super__) {
          inherits(ThrowObservable, __super__);
          function ThrowObservable(error, scheduler) {
            this._error = error;
            this._scheduler = scheduler;
            __super__.call(this)
          }
          return ThrowObservable
        }(ObservableBase);
        var observableThrow = Observable['throw'] = function (error, scheduler) {
          isScheduler(scheduler) || (scheduler = immediateScheduler);
          return new ThrowObservable(error, scheduler)
        };
        var UsingObservable = function (__super__) {
          inherits(UsingObservable, __super__);
          function UsingObservable(resFn, obsFn) {
            this._resFn = resFn;
            this._obsFn = obsFn;
            __super__.call(this)
          }
          return UsingObservable
        }(ObservableBase);
        Observable.using = function (resourceFactory, observableFactory) {
          return new UsingObservable(resourceFactory, observableFactory)
        };
        observableProto.amb = function (rightSource) {
          var leftSource = this;
          return new AnonymousObservable()
        };
        Observable.amb = function () {
          var acc = observableNever(), items;
          if (Array.isArray(arguments[0])) {
            items = arguments[0]
          } else {
            var len = arguments.length;
            items = new Array(items);
            for (var i = 0; i < len; i++) {
              items[i] = arguments[i]
            }
          }
          for (var i = 0, len = items.length; i < len; i++) {
            acc = amb(acc, items[i])
          }
          return acc
        };
        var CatchObservable = function (__super__) {
          inherits(CatchObservable, __super__);
          function CatchObservable(source, fn) {
            this.source = source;
            this._fn = fn;
            __super__.call(this)
          }
          return CatchObservable
        }(ObservableBase);
        var CatchObserver = function (__super__) {
          inherits(CatchObserver, __super__);
          function CatchObserver(o, s, fn) {
            this._o = o;
            this._s = s;
            this._fn = fn;
            __super__.call(this)
          }
          return CatchObserver
        }(AbstractObserver);
        observableProto['catch'] = function (handlerOrSecond) {
          return isFunction(handlerOrSecond) ? new CatchObservable(this, handlerOrSecond) : observableCatch([
            this,
            handlerOrSecond
          ])
        };
        var observableCatch = Observable['catch'] = function () {
          var items;
          if (Array.isArray(arguments[0])) {
            items = arguments[0]
          } else {
            var len = arguments.length;
            items = new Array(len);
            for (var i = 0; i < len; i++) {
              items[i] = arguments[i]
            }
          }
          return enumerableOf(items).catchError()
        };
        observableProto.combineLatest = function () {
          var len = arguments.length, args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          if (Array.isArray(args[0])) {
            args[0].unshift(this)
          } else {
            args.unshift(this)
          }
          return combineLatest.apply(this, args)
        };
        function argumentsToArray() {
          var len = arguments.length, args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          return args
        }
        var CombineLatestObservable = function (__super__) {
          inherits(CombineLatestObservable, __super__);
          function CombineLatestObservable(params, cb) {
            this._params = params;
            this._cb = cb;
            __super__.call(this)
          }
          CombineLatestObservable.prototype.subscribeCore = function (observer) {
            var len = this._params.length, subscriptions = new Array(len);
            var state = {
              hasValue: arrayInitialize(len, falseFactory),
              hasValueAll: false,
              isDone: arrayInitialize(len, falseFactory),
              values: new Array(len)
            };
            for (var i = 0; i < len; i++) {
              var source = this._params[i], sad = new SingleAssignmentDisposable();
              subscriptions[i] = sad;
              isPromise(source) && (source = observableFromPromise(source));
              sad.setDisposable(source.subscribe(new CombineLatestObserver(observer, i, this._cb, state)))
            }
            return new NAryDisposable(subscriptions)
          };
          return CombineLatestObservable
        }(ObservableBase);
        var CombineLatestObserver = function (__super__) {
          inherits(CombineLatestObserver, __super__);
          function CombineLatestObserver(o, i, cb, state) {
            this._o = o;
            this._i = i;
            this._cb = cb;
            this._state = state;
            __super__.call(this)
          }
          function notTheSame(i) {
            return function (x, j) {
              return j !== i
            }
          }
          CombineLatestObserver.prototype.next = function (x) {
            this._state.values[this._i] = x;
            this._state.hasValue[this._i] = true;
            if (this._state.hasValueAll || (this._state.hasValueAll = this._state.hasValue.every(identity))) {
              var res = tryCatch(this._cb).apply(null, this._state.values);
              if (res === errorObj) {
                return this._o.onError(res.e)
              }
              this._o.onNext(res)
            } else if (this._state.isDone.filter(notTheSame(this._i)).every(identity)) {
              this._o.onCompleted()
            }
          };
          CombineLatestObserver.prototype.error = function (e) {
            this._o.onError(e)
          };
          CombineLatestObserver.prototype.completed = function () {
            this._state.isDone[this._i] = true;
            this._state.isDone.every(identity) && this._o.onCompleted()
          };
          return CombineLatestObserver
        }(AbstractObserver);
        var combineLatest = Observable.combineLatest = function () {
          var len = arguments.length, args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
          Array.isArray(args[0]) && (args = args[0]);
          return new CombineLatestObservable(args, resultSelector)
        };
        observableProto.concat = function () {
          for (var args = [], i = 0, len = arguments.length; i < len; i++) {
            args.push(arguments[i])
          }
          args.unshift(this);
          return observableConcat.apply(null, args)
        };
        var ConcatObserver = function (__super__) {
          inherits(ConcatObserver, __super__);
          function ConcatObserver(s, fn) {
            this._s = s;
            this._fn = fn;
            __super__.call(this)
          }
          ConcatObserver.prototype.next = function (x) {
            this._s.o.onNext(x)
          };
          ConcatObserver.prototype.error = function (e) {
            this._s.o.onError(e)
          };
          ConcatObserver.prototype.completed = function () {
            this._s.i++;
            this._fn(this._s)
          };
          return ConcatObserver
        }(AbstractObserver);
        var ConcatObservable = function (__super__) {
          inherits(ConcatObservable, __super__);
          function ConcatObservable(sources) {
            this._sources = sources;
            __super__.call(this)
          }
          function scheduleRecursive(state, recurse) {
            if (state.disposable.isDisposed) {
              return
            }
            if (state.i === state.sources.length) {
              return state.o.onCompleted()
            }
            var currentValue = state.sources[state.i];
            isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
            var d = new SingleAssignmentDisposable();
            state.subscription.setDisposable(d);
            d.setDisposable(currentValue.subscribe(new ConcatObserver(state, recurse)))
          }
          ConcatObservable.prototype.subscribeCore = function (o) {
            var subscription = new SerialDisposable();
            var disposable = disposableCreate(noop);
            var state = {
              o: o,
              i: 0,
              subscription: subscription,
              disposable: disposable,
              sources: this._sources
            };
            var cancelable = immediateScheduler.scheduleRecursive(state, scheduleRecursive);
            return new NAryDisposable([
              subscription,
              disposable,
              cancelable
            ])
          };
          return ConcatObservable
        }(ObservableBase);
        var observableConcat = Observable.concat = function () {
          var args;
          if (Array.isArray(arguments[0])) {
            args = arguments[0]
          } else {
            args = new Array(arguments.length);
            for (var i = 0, len = arguments.length; i < len; i++) {
              args[i] = arguments[i]
            }
          }
          return new ConcatObservable(args)
        };
        observableProto.concatAll = function () {
          return this.merge(1)
        };
        var MergeObservable = function (__super__) {
          inherits(MergeObservable, __super__);
          function MergeObservable(source, maxConcurrent) {
            this.source = source;
            this.maxConcurrent = maxConcurrent;
            __super__.call(this)
          }
          return MergeObservable
        }(ObservableBase);
        var MergeObserver = function (__super__) {
          function MergeObserver(o, max, g) {
            this.o = o;
            this.max = max;
            this.g = g;
            this.done = false;
            this.q = [];
            this.activeCount = 0;
            __super__.call(this)
          }
          inherits(MergeObserver, __super__);
          MergeObserver.prototype.completed = function () {
            this.done = true;
            this.activeCount === 0 && this.o.onCompleted()
          };
          function InnerObserver(parent, sad) {
            this.parent = parent;
            this.sad = sad;
            __super__.call(this)
          }
          inherits(InnerObserver, __super__);
          InnerObserver.prototype.next = function (x) {
            this.parent.o.onNext(x)
          };
          InnerObserver.prototype.error = function (e) {
            this.parent.o.onError(e)
          };
          InnerObserver.prototype.completed = function () {
            this.parent.g.remove(this.sad);
            if (this.parent.q.length > 0) {
              this.parent.handleSubscribe(this.parent.q.shift())
            } else {
              this.parent.activeCount--;
              this.parent.done && this.parent.activeCount === 0 && this.parent.o.onCompleted()
            }
          };
          return MergeObserver
        }(AbstractObserver);
        observableProto.merge = function (maxConcurrentOrOther) {
          return typeof maxConcurrentOrOther !== 'number' ? observableMerge(this, maxConcurrentOrOther) : new MergeObservable(this, maxConcurrentOrOther)
        };
        var observableMerge = Observable.merge = function () {
          var scheduler, sources = [], i, len = arguments.length;
          if (!arguments[0]) {
            scheduler = immediateScheduler;
            for (i = 1; i < len; i++) {
              sources.push(arguments[i])
            }
          } else if (isScheduler(arguments[0])) {
            scheduler = arguments[0];
            for (i = 1; i < len; i++) {
              sources.push(arguments[i])
            }
          } else {
            scheduler = immediateScheduler;
            for (i = 0; i < len; i++) {
              sources.push(arguments[i])
            }
          }
          if (Array.isArray(sources[0])) {
            sources = sources[0]
          }
          return observableOf(scheduler, sources).mergeAll()
        };
        var MergeAllObservable = function (__super__) {
          inherits(MergeAllObservable, __super__);
          function MergeAllObservable(source) {
            this.source = source;
            __super__.call(this)
          }
          MergeAllObservable.prototype.subscribeCore = function (o) {
            var g = new CompositeDisposable(), m = new SingleAssignmentDisposable();
            g.add(m);
            m.setDisposable(this.source.subscribe(new MergeAllObserver(o, g)));
            return g
          };
          return MergeAllObservable
        }(ObservableBase);
        var MergeAllObserver = function (__super__) {
          function MergeAllObserver(o, g) {
            this.o = o;
            this.g = g;
            this.done = false;
            __super__.call(this)
          }
          inherits(MergeAllObserver, __super__);
          MergeAllObserver.prototype.next = function (innerSource) {
            var sad = new SingleAssignmentDisposable();
            this.g.add(sad);
            isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
            sad.setDisposable(innerSource.subscribe(new InnerObserver(this, sad)))
          };
          MergeAllObserver.prototype.error = function (e) {
            this.o.onError(e)
          };
          MergeAllObserver.prototype.completed = function () {
            this.done = true;
            this.g.length === 1 && this.o.onCompleted()
          };
          function InnerObserver(parent, sad) {
            this.parent = parent;
            this.sad = sad;
            __super__.call(this)
          }
          inherits(InnerObserver, __super__);
          InnerObserver.prototype.next = function (x) {
            this.parent.o.onNext(x)
          };
          InnerObserver.prototype.error = function (e) {
            this.parent.o.onError(e)
          };
          InnerObserver.prototype.completed = function () {
            this.parent.g.remove(this.sad);
            this.parent.done && this.parent.g.length === 1 && this.parent.o.onCompleted()
          };
          return MergeAllObserver
        }(AbstractObserver);
        observableProto.mergeAll = function () {
          return new MergeAllObservable(this)
        };
        var CompositeError = Rx.CompositeError = function (errors) {
          this.innerErrors = errors;
          this.message = 'This contains multiple errors. Check the innerErrors';
          Error.call(this)
        };
        CompositeError.prototype = Object.create(Error.prototype);
        CompositeError.prototype.name = 'CompositeError';
        var MergeDelayErrorObservable = function (__super__) {
          inherits(MergeDelayErrorObservable, __super__);
          function MergeDelayErrorObservable(source) {
            this.source = source;
            __super__.call(this)
          }
          return MergeDelayErrorObservable
        }(ObservableBase);
        var MergeDelayErrorObserver = function (__super__) {
          inherits(MergeDelayErrorObserver, __super__);
          function MergeDelayErrorObserver(group, state) {
            this._group = group;
            this._state = state;
            __super__.call(this)
          }
          MergeDelayErrorObserver.prototype.completed = function () {
            this._state.isStopped = true;
            this._group.length === 1 && setCompletion(this._state.o, this._state.errors)
          };
          inherits(InnerObserver, __super__);
          function InnerObserver(inner, group, state) {
            this._inner = inner;
            this._group = group;
            this._state = state;
            __super__.call(this)
          }
          InnerObserver.prototype.next = function (x) {
            this._state.o.onNext(x)
          };
          InnerObserver.prototype.error = function (e) {
            this._state.errors.push(e);
            this._group.remove(this._inner);
            this._state.isStopped && this._group.length === 1 && setCompletion(this._state.o, this._state.errors)
          };
          InnerObserver.prototype.completed = function () {
            this._group.remove(this._inner);
            this._state.isStopped && this._group.length === 1 && setCompletion(this._state.o, this._state.errors)
          };
          return MergeDelayErrorObserver
        }(AbstractObserver);
        Observable.mergeDelayError = function () {
          var args;
          if (Array.isArray(arguments[0])) {
            args = arguments[0]
          } else {
            var len = arguments.length;
            args = new Array(len);
            for (var i = 0; i < len; i++) {
              args[i] = arguments[i]
            }
          }
          var source = observableOf(null, args);
          return new MergeDelayErrorObservable(source)
        };
        observableProto.onErrorResumeNext = function (second) {
          if (!second) {
            throw new Error('Second observable is required')
          }
          return onErrorResumeNext([
            this,
            second
          ])
        };
        var OnErrorResumeNextObservable = function (__super__) {
          inherits(OnErrorResumeNextObservable, __super__);
          function OnErrorResumeNextObservable(sources) {
            this.sources = sources;
            __super__.call(this)
          }
          return OnErrorResumeNextObservable
        }(ObservableBase);
        var OnErrorResumeNextObserver = function (__super__) {
          inherits(OnErrorResumeNextObserver, __super__);
          function OnErrorResumeNextObserver(state, recurse) {
            this._state = state;
            this._recurse = recurse;
            __super__.call(this)
          }
          return OnErrorResumeNextObserver
        }(AbstractObserver);
        var onErrorResumeNext = Observable.onErrorResumeNext = function () {
          var sources = [];
          if (Array.isArray(arguments[0])) {
            sources = arguments[0]
          } else {
            var len = arguments.length;
            sources = new Array(len);
            for (var i = 0; i < len; i++) {
              sources[i] = arguments[i]
            }
          }
          return new OnErrorResumeNextObservable(sources)
        };
        var SkipUntilObservable = function (__super__) {
          inherits(SkipUntilObservable, __super__);
          function SkipUntilObservable(source, other) {
            this._s = source;
            this._o = isPromise(other) ? observableFromPromise(other) : other;
            this._open = false;
            __super__.call(this)
          }
          return SkipUntilObservable
        }(ObservableBase);
        var SkipUntilSourceObserver = function (__super__) {
          inherits(SkipUntilSourceObserver, __super__);
          function SkipUntilSourceObserver(o, p) {
            this._o = o;
            this._p = p;
            __super__.call(this)
          }
          return SkipUntilSourceObserver
        }(AbstractObserver);
        var SkipUntilOtherObserver = function (__super__) {
          inherits(SkipUntilOtherObserver, __super__);
          function SkipUntilOtherObserver(o, p, r) {
            this._o = o;
            this._p = p;
            this._r = r;
            __super__.call(this)
          }
          return SkipUntilOtherObserver
        }(AbstractObserver);
        observableProto.skipUntil = function (other) {
          return new SkipUntilObservable(this, other)
        };
        var SwitchObservable = function (__super__) {
          inherits(SwitchObservable, __super__);
          function SwitchObservable(source) {
            this.source = source;
            __super__.call(this)
          }
          SwitchObservable.prototype.subscribeCore = function (o) {
            var inner = new SerialDisposable(), s = this.source.subscribe(new SwitchObserver(o, inner));
            return new BinaryDisposable(s, inner)
          };
          inherits(SwitchObserver, AbstractObserver);
          function SwitchObserver(o, inner) {
            this.o = o;
            this.inner = inner;
            this.stopped = false;
            this.latest = 0;
            this.hasLatest = false;
            AbstractObserver.call(this)
          }
          SwitchObserver.prototype.next = function (innerSource) {
            var d = new SingleAssignmentDisposable(), id = ++this.latest;
            this.hasLatest = true;
            this.inner.setDisposable(d);
            isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
            d.setDisposable(innerSource.subscribe(new InnerObserver(this, id)))
          };
          SwitchObserver.prototype.error = function (e) {
            this.o.onError(e)
          };
          SwitchObserver.prototype.completed = function () {
            this.stopped = true;
            !this.hasLatest && this.o.onCompleted()
          };
          inherits(InnerObserver, AbstractObserver);
          function InnerObserver(parent, id) {
            this.parent = parent;
            this.id = id;
            AbstractObserver.call(this)
          }
          InnerObserver.prototype.next = function (x) {
            this.parent.latest === this.id && this.parent.o.onNext(x)
          };
          InnerObserver.prototype.error = function (e) {
            this.parent.latest === this.id && this.parent.o.onError(e)
          };
          InnerObserver.prototype.completed = function () {
            if (this.parent.latest === this.id) {
              this.parent.hasLatest = false;
              this.parent.stopped && this.parent.o.onCompleted()
            }
          };
          return SwitchObservable
        }(ObservableBase);
        observableProto['switch'] = observableProto.switchLatest = function () {
          return new SwitchObservable(this)
        };
        var TakeUntilObservable = function (__super__) {
          inherits(TakeUntilObservable, __super__);
          function TakeUntilObservable(source, other) {
            this.source = source;
            this.other = isPromise(other) ? observableFromPromise(other) : other;
            __super__.call(this)
          }
          return TakeUntilObservable
        }(ObservableBase);
        var TakeUntilObserver = function (__super__) {
          inherits(TakeUntilObserver, __super__);
          function TakeUntilObserver(o) {
            this._o = o;
            __super__.call(this)
          }
          return TakeUntilObserver
        }(AbstractObserver);
        observableProto.takeUntil = function (other) {
          return new TakeUntilObservable(this, other)
        };
        function argumentsToArray() {
          var len = arguments.length, args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          return args
        }
        var WithLatestFromObservable = function (__super__) {
          inherits(WithLatestFromObservable, __super__);
          function WithLatestFromObservable(source, sources, resultSelector) {
            this._s = source;
            this._ss = sources;
            this._cb = resultSelector;
            __super__.call(this)
          }
          return WithLatestFromObservable
        }(ObservableBase);
        var WithLatestFromOtherObserver = function (__super__) {
          inherits(WithLatestFromOtherObserver, __super__);
          function WithLatestFromOtherObserver(o, i, state) {
            this._o = o;
            this._i = i;
            this._state = state;
            __super__.call(this)
          }
          return WithLatestFromOtherObserver
        }(AbstractObserver);
        var WithLatestFromSourceObserver = function (__super__) {
          inherits(WithLatestFromSourceObserver, __super__);
          function WithLatestFromSourceObserver(o, cb, state) {
            this._o = o;
            this._cb = cb;
            this._state = state;
            __super__.call(this)
          }
          return WithLatestFromSourceObserver
        }(AbstractObserver);
        observableProto.withLatestFrom = function () {
          if (arguments.length === 0) {
            throw new Error('invalid arguments')
          }
          var len = arguments.length, args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
          Array.isArray(args[0]) && (args = args[0]);
          return new WithLatestFromObservable(this, args, resultSelector)
        };
        function emptyArrayFactory() {
          return []
        }
        var ZipObservable = function (__super__) {
          inherits(ZipObservable, __super__);
          function ZipObservable(sources, resultSelector) {
            this._s = sources;
            this._cb = resultSelector;
            __super__.call(this)
          }
          return ZipObservable
        }(ObservableBase);
        var ZipObserver = function (__super__) {
          inherits(ZipObserver, __super__);
          function ZipObserver(o, i, p, q, d) {
            this._o = o;
            this._i = i;
            this._p = p;
            this._q = q;
            this._d = d;
            __super__.call(this)
          }
          ZipObserver.prototype.next = function (x) {
            this._q[this._i].push(x);
            if (this._q.every(notEmpty)) {
              var queuedValues = this._q.map(shiftEach);
              var res = tryCatch(this._p._cb).apply(null, queuedValues);
              if (res === errorObj) {
                return this._o.onError(res.e)
              }
              this._o.onNext(res)
            } else if (this._d.filter(notTheSame(this._i)).every(identity)) {
              this._o.onCompleted()
            }
          };
          return ZipObserver
        }(AbstractObserver);
        observableProto.zip = function () {
          if (arguments.length === 0) {
            throw new Error('invalid arguments')
          }
          var len = arguments.length, args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
          Array.isArray(args[0]) && (args = args[0]);
          var parent = this;
          args.unshift(parent);
          return new ZipObservable(args, resultSelector)
        };
        Observable.zip = function () {
          var len = arguments.length, args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          if (Array.isArray(args[0])) {
            args = isFunction(args[1]) ? args[0].concat(args[1]) : args[0]
          }
          var first = args.shift();
          return first.zip.apply(first, args)
        };
        function falseFactory() {
          return false
        }
        function argumentsToArray() {
          var len = arguments.length, args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          return args
        }
        var ZipIterableObservable = function (__super__) {
          inherits(ZipIterableObservable, __super__);
          function ZipIterableObservable(sources, cb) {
            this.sources = sources;
            this._cb = cb;
            __super__.call(this)
          }
          return ZipIterableObservable
        }(ObservableBase);
        var ZipIterableObserver = function (__super__) {
          inherits(ZipIterableObserver, __super__);
          function ZipIterableObserver(s, i) {
            this._s = s;
            this._i = i;
            __super__.call(this)
          }
          ZipIterableObserver.prototype.next = function (x) {
            this._s.q[this._i].push(x);
            if (this._s.q.every(notEmpty)) {
              var queuedValues = this._s.q.map(shiftEach), res = tryCatch(this._s.cb).apply(null, queuedValues);
              if (res === errorObj) {
                return this._s.o.onError(res.e)
              }
              this._s.o.onNext(res)
            } else if (this._s.done.filter(notTheSame(this._i)).every(identity)) {
              this._s.o.onCompleted()
            }
          };
          return ZipIterableObserver
        }(AbstractObserver);
        observableProto.zipIterable = function () {
          if (arguments.length === 0) {
            throw new Error('invalid arguments')
          }
          var len = arguments.length, args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
          var parent = this;
          args.unshift(parent);
          return new ZipIterableObservable(args, resultSelector)
        };
        function asObservable(source) {
          return function subscribe(o) {
            return source.subscribe(o)
          }
        }
        observableProto.asObservable = function () {
          return new AnonymousObservable(asObservable(this), this)
        };
        function notEmpty(x) {
          return x.length > 0
        }
        observableProto.bufferWithCount = observableProto.bufferCount = function (count, skip) {
          typeof skip !== 'number' && (skip = count);
          return this.windowWithCount(count, skip).flatMap(toArray).filter(notEmpty)
        };
        var DematerializeObservable = function (__super__) {
          inherits(DematerializeObservable, __super__);
          function DematerializeObservable(source) {
            this.source = source;
            __super__.call(this)
          }
          return DematerializeObservable
        }(ObservableBase);
        var DematerializeObserver = function (__super__) {
          inherits(DematerializeObserver, __super__);
          function DematerializeObserver(o) {
            this._o = o;
            __super__.call(this)
          }
          return DematerializeObserver
        }(AbstractObserver);
        observableProto.dematerialize = function () {
          return new DematerializeObservable(this)
        };
        var DistinctUntilChangedObservable = function (__super__) {
          inherits(DistinctUntilChangedObservable, __super__);
          function DistinctUntilChangedObservable(source, keyFn, comparer) {
            this.source = source;
            this.keyFn = keyFn;
            this.comparer = comparer;
            __super__.call(this)
          }
          return DistinctUntilChangedObservable
        }(ObservableBase);
        var DistinctUntilChangedObserver = function (__super__) {
          inherits(DistinctUntilChangedObserver, __super__);
          function DistinctUntilChangedObserver(o, keyFn, comparer) {
            this.o = o;
            this.keyFn = keyFn;
            this.comparer = comparer;
            this.hasCurrentKey = false;
            this.currentKey = null;
            __super__.call(this)
          }
          return DistinctUntilChangedObserver
        }(AbstractObserver);
        observableProto.distinctUntilChanged = function (keyFn, comparer) {
          comparer || (comparer = defaultComparer);
          return new DistinctUntilChangedObservable(this, keyFn, comparer)
        };
        var TapObservable = function (__super__) {
          inherits(TapObservable, __super__);
          function TapObservable(source, observerOrOnNext, onError, onCompleted) {
            this.source = source;
            this._oN = observerOrOnNext;
            this._oE = onError;
            this._oC = onCompleted;
            __super__.call(this)
          }
          TapObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new InnerObserver(o, this))
          };
          inherits(InnerObserver, AbstractObserver);
          function InnerObserver(o, p) {
            this.o = o;
            this.t = !p._oN || isFunction(p._oN) ? observerCreate(p._oN || noop, p._oE || noop, p._oC || noop) : p._oN;
            this.isStopped = false;
            AbstractObserver.call(this)
          }
          InnerObserver.prototype.next = function (x) {
            var res = tryCatch(this.t.onNext).call(this.t, x);
            if (res === errorObj) {
              this.o.onError(res.e)
            }
            this.o.onNext(x)
          };
          InnerObserver.prototype.error = function (err) {
            var res = tryCatch(this.t.onError).call(this.t, err);
            if (res === errorObj) {
              return this.o.onError(res.e)
            }
            this.o.onError(err)
          };
          InnerObserver.prototype.completed = function () {
            var res = tryCatch(this.t.onCompleted).call(this.t);
            if (res === errorObj) {
              return this.o.onError(res.e)
            }
            this.o.onCompleted()
          };
          return TapObservable
        }(ObservableBase);
        observableProto['do'] = observableProto.tap = observableProto.doAction = function (observerOrOnNext, onError, onCompleted) {
          return new TapObservable(this, observerOrOnNext, onError, onCompleted)
        };
        observableProto.doOnNext = observableProto.tapOnNext = function (onNext, thisArg) {
          return this.tap(typeof thisArg !== 'undefined' ? function (x) {
            onNext.call(thisArg, x)
          } : onNext)
        };
        observableProto.doOnError = observableProto.tapOnError = function (onError, thisArg) {
          return this.tap(noop, typeof thisArg !== 'undefined' ? function (e) {
            onError.call(thisArg, e)
          } : onError)
        };
        observableProto.doOnCompleted = observableProto.tapOnCompleted = function (onCompleted, thisArg) {
          return this.tap(noop, null, typeof thisArg !== 'undefined' ? function () {
            onCompleted.call(thisArg)
          } : onCompleted)
        };
        var FinallyObservable = function (__super__) {
          inherits(FinallyObservable, __super__);
          function FinallyObservable(source, fn, thisArg) {
            this.source = source;
            this._fn = bindCallback(fn, thisArg, 0);
            __super__.call(this)
          }
          function FinallyDisposable(s, fn) {
            this.isDisposed = false;
            this._s = s;
            this._fn = fn
          }
          return FinallyObservable
        }(ObservableBase);
        observableProto['finally'] = function (action, thisArg) {
          return new FinallyObservable(this, action, thisArg)
        };
        var IgnoreElementsObservable = function (__super__) {
          inherits(IgnoreElementsObservable, __super__);
          function IgnoreElementsObservable(source) {
            this.source = source;
            __super__.call(this)
          }
          function InnerObserver(o) {
            this.o = o;
            this.isStopped = false
          }
          InnerObserver.prototype.onNext = noop;
          InnerObserver.prototype.onError = function (err) {
            if (!this.isStopped) {
              this.isStopped = true;
              this.o.onError(err)
            }
          };
          InnerObserver.prototype.onCompleted = function () {
            if (!this.isStopped) {
              this.isStopped = true;
              this.o.onCompleted()
            }
          };
          InnerObserver.prototype.dispose = function () {
            this.isStopped = true
          };
          InnerObserver.prototype.fail = function (e) {
            if (!this.isStopped) {
              this.isStopped = true;
              this.observer.onError(e);
              return true
            }
            return false
          };
          return IgnoreElementsObservable
        }(ObservableBase);
        observableProto.ignoreElements = function () {
          return new IgnoreElementsObservable(this)
        };
        var MaterializeObservable = function (__super__) {
          inherits(MaterializeObservable, __super__);
          function MaterializeObservable(source, fn) {
            this.source = source;
            __super__.call(this)
          }
          return MaterializeObservable
        }(ObservableBase);
        var MaterializeObserver = function (__super__) {
          inherits(MaterializeObserver, __super__);
          function MaterializeObserver(o) {
            this._o = o;
            __super__.call(this)
          }
          return MaterializeObserver
        }(AbstractObserver);
        observableProto.materialize = function () {
          return new MaterializeObservable(this)
        };
        observableProto.repeat = function (repeatCount) {
          return enumerableRepeat(this, repeatCount).concat()
        };
        observableProto.retry = function (retryCount) {
          return enumerableRepeat(this, retryCount).catchError()
        };
        var RetryWhenObservable = function (__super__) {
          function createDisposable(state) {
            return {
              isDisposed: false,
              dispose: function () {
                if (!this.isDisposed) {
                  this.isDisposed = true;
                  state.isDisposed = true
                }
              }
            }
          }
          function RetryWhenObservable(source, notifier) {
            this.source = source;
            this._notifier = notifier;
            __super__.call(this)
          }
          inherits(RetryWhenObservable, __super__);
          RetryWhenObservable.prototype.subscribeCore = function (o) {
            var exceptions = new Subject(), notifier = new Subject(), handled = this._notifier(exceptions), notificationDisposable = handled.subscribe(notifier);
            var e = this.source['@@iterator']();
            var state = { isDisposed: false }, lastError, subscription = new SerialDisposable();
            var cancelable = currentThreadScheduler.scheduleRecursive(null, function (_, recurse) {
              if (state.isDisposed) {
                return
              }
              var currentItem = e.next();
              if (currentItem.done) {
                if (lastError) {
                  o.onError(lastError)
                } else {
                  o.onCompleted()
                }
                return
              }
              var currentValue = currentItem.value;
              isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
              var outer = new SingleAssignmentDisposable();
              var inner = new SingleAssignmentDisposable();
              subscription.setDisposable(new BinaryDisposable(inner, outer));
              outer.setDisposable(currentValue.subscribe(function (x) {
                o.onNext(x)
              }, function (exn) {
                inner.setDisposable(notifier.subscribe(recurse, function (ex) {
                  o.onError(ex)
                }, function () {
                  o.onCompleted()
                }));
                exceptions.onNext(exn);
                outer.dispose()
              }, function () {
                o.onCompleted()
              }))
            });
            return new NAryDisposable([
              notificationDisposable,
              subscription,
              cancelable,
              createDisposable(state)
            ])
          };
          return RetryWhenObservable
        }(ObservableBase);
        observableProto.retryWhen = function (notifier) {
          return new RetryWhenObservable(repeat(this), notifier)
        };
        var RepeatWhenObservable = function (__super__) {
          function createDisposable(state) {
            return {
              isDisposed: false,
              dispose: function () {
                if (!this.isDisposed) {
                  this.isDisposed = true;
                  state.isDisposed = true
                }
              }
            }
          }
          function RepeatWhenObservable(source, notifier) {
            this.source = source;
            this._notifier = notifier;
            __super__.call(this)
          }
          inherits(RepeatWhenObservable, __super__);
          RepeatWhenObservable.prototype.subscribeCore = function (o) {
            var completions = new Subject(), notifier = new Subject(), handled = this._notifier(completions), notificationDisposable = handled.subscribe(notifier);
            var e = this.source['@@iterator']();
            var state = { isDisposed: false }, lastError, subscription = new SerialDisposable();
            var cancelable = currentThreadScheduler.scheduleRecursive(null, function (_, recurse) {
              if (state.isDisposed) {
                return
              }
              var currentItem = e.next();
              if (currentItem.done) {
                if (lastError) {
                  o.onError(lastError)
                } else {
                  o.onCompleted()
                }
                return
              }
              var currentValue = currentItem.value;
              isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));
              var outer = new SingleAssignmentDisposable();
              var inner = new SingleAssignmentDisposable();
              subscription.setDisposable(new BinaryDisposable(inner, outer));
              outer.setDisposable(currentValue.subscribe(function (x) {
                o.onNext(x)
              }, function (exn) {
                o.onError(exn)
              }, function () {
                inner.setDisposable(notifier.subscribe(recurse, function (ex) {
                  o.onError(ex)
                }, function () {
                  o.onCompleted()
                }));
                completions.onNext(null);
                outer.dispose()
              }))
            });
            return new NAryDisposable([
              notificationDisposable,
              subscription,
              cancelable,
              createDisposable(state)
            ])
          };
          return RepeatWhenObservable
        }(ObservableBase);
        observableProto.repeatWhen = function (notifier) {
          return new RepeatWhenObservable(repeat(this), notifier)
        };
        var ScanObservable = function (__super__) {
          inherits(ScanObservable, __super__);
          function ScanObservable(source, accumulator, hasSeed, seed) {
            this.source = source;
            this.accumulator = accumulator;
            this.hasSeed = hasSeed;
            this.seed = seed;
            __super__.call(this)
          }
          ScanObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new ScanObserver(o, this))
          };
          return ScanObservable
        }(ObservableBase);
        var ScanObserver = function (__super__) {
          inherits(ScanObserver, __super__);
          function ScanObserver(o, parent) {
            this._o = o;
            this._p = parent;
            this._fn = parent.accumulator;
            this._hs = parent.hasSeed;
            this._s = parent.seed;
            this._ha = false;
            this._a = null;
            this._hv = false;
            this._i = 0;
            __super__.call(this)
          }
          ScanObserver.prototype.next = function (x) {
            !this._hv && (this._hv = true);
            if (this._ha) {
              this._a = tryCatch(this._fn)(this._a, x, this._i, this._p)
            } else {
              this._a = this._hs ? tryCatch(this._fn)(this._s, x, this._i, this._p) : x;
              this._ha = true
            }
            if (this._a === errorObj) {
              return this._o.onError(this._a.e)
            }
            this._o.onNext(this._a);
            this._i++
          };
          ScanObserver.prototype.error = function (e) {
            this._o.onError(e)
          };
          ScanObserver.prototype.completed = function () {
            !this._hv && this._hs && this._o.onNext(this._s);
            this._o.onCompleted()
          };
          return ScanObserver
        }(AbstractObserver);
        observableProto.scan = function () {
          var hasSeed = false, seed, accumulator = arguments[0];
          if (arguments.length === 2) {
            hasSeed = true;
            seed = arguments[1]
          }
          return new ScanObservable(this, accumulator, hasSeed, seed)
        };
        var SkipLastObservable = function (__super__) {
          inherits(SkipLastObservable, __super__);
          function SkipLastObservable(source, c) {
            this.source = source;
            this._c = c;
            __super__.call(this)
          }
          return SkipLastObservable
        }(ObservableBase);
        var SkipLastObserver = function (__super__) {
          inherits(SkipLastObserver, __super__);
          function SkipLastObserver(o, c) {
            this._o = o;
            this._c = c;
            this._q = [];
            __super__.call(this)
          }
          return SkipLastObserver
        }(AbstractObserver);
        observableProto.skipLast = function (count) {
          if (count < 0) {
            throw new ArgumentOutOfRangeError()
          }
          return new SkipLastObservable(this, count)
        };
        observableProto.startWith = function () {
          var values, scheduler, start = 0;
          if (!!arguments.length && isScheduler(arguments[0])) {
            scheduler = arguments[0];
            start = 1
          } else {
            scheduler = immediateScheduler
          }
          for (var args = [], i = start, len = arguments.length; i < len; i++) {
            args.push(arguments[i])
          }
          return observableConcat.apply(null, [
            observableFromArray(args, scheduler),
            this
          ])
        };
        var TakeLastObserver = function (__super__) {
          inherits(TakeLastObserver, __super__);
          function TakeLastObserver(o, c) {
            this._o = o;
            this._c = c;
            this._q = [];
            __super__.call(this)
          }
          return TakeLastObserver
        }(AbstractObserver);
        observableProto.takeLast = function (count) {
          if (count < 0) {
            throw new ArgumentOutOfRangeError()
          }
          var source = this;
          return new AnonymousObservable(source)
        };
        var TakeLastBufferObserver = function (__super__) {
          inherits(TakeLastBufferObserver, __super__);
          function TakeLastBufferObserver(o, c) {
            this._o = o;
            this._c = c;
            this._q = [];
            __super__.call(this)
          }
          return TakeLastBufferObserver
        }(AbstractObserver);
        observableProto.takeLastBuffer = function (count) {
          if (count < 0) {
            throw new ArgumentOutOfRangeError()
          }
          var source = this;
          return new AnonymousObservable(source)
        };
        observableProto.windowWithCount = observableProto.windowCount = function (count, skip) {
          var source = this;
          +count || (count = 0);
          Math.abs(count) === Infinity && (count = 0);
          if (count <= 0) {
            throw new ArgumentOutOfRangeError()
          }
          skip == null && (skip = count);
          +skip || (skip = 0);
          Math.abs(skip) === Infinity && (skip = 0);
          if (skip <= 0) {
            throw new ArgumentOutOfRangeError()
          }
          return new AnonymousObservable(source)
        };
        observableProto.selectConcat = observableProto.concatMap = function (selector, resultSelector, thisArg) {
          if (isFunction(selector) && isFunction(resultSelector)) {
            return this.concatMap(function (x, i) {
              var selectorResult = selector(x, i);
              isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
              (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));
              return selectorResult.map(function (y, i2) {
                return resultSelector(x, y, i, i2)
              })
            })
          }
          return isFunction(selector) ? concatMap(this, selector, thisArg) : concatMap(this, function () {
            return selector
          })
        };
        observableProto.concatMapObserver = observableProto.selectConcatObserver = function (onNext, onError, onCompleted, thisArg) {
          var source = this, onNextFunc = bindCallback(onNext, thisArg, 2), onErrorFunc = bindCallback(onError, thisArg, 1), onCompletedFunc = bindCallback(onCompleted, thisArg, 0);
          return new AnonymousObservable(this).concatAll()
        };
        var DefaultIfEmptyObserver = function (__super__) {
          inherits(DefaultIfEmptyObserver, __super__);
          function DefaultIfEmptyObserver(o, d) {
            this._o = o;
            this._d = d;
            this._f = false;
            __super__.call(this)
          }
          return DefaultIfEmptyObserver
        }(AbstractObserver);
        observableProto.defaultIfEmpty = function (defaultValue) {
          var source = this;
          defaultValue === undefined && (defaultValue = null);
          return new AnonymousObservable(source)
        };
        function HashSet(comparer) {
          this.comparer = comparer;
          this.set = []
        }
        var DistinctObservable = function (__super__) {
          inherits(DistinctObservable, __super__);
          function DistinctObservable(source, keyFn, cmpFn) {
            this.source = source;
            this._keyFn = keyFn;
            this._cmpFn = cmpFn;
            __super__.call(this)
          }
          DistinctObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new DistinctObserver(o, this._keyFn, this._cmpFn))
          };
          return DistinctObservable
        }(ObservableBase);
        var DistinctObserver = function (__super__) {
          inherits(DistinctObserver, __super__);
          function DistinctObserver(o, keyFn, cmpFn) {
            this._o = o;
            this._keyFn = keyFn;
            this._h = new HashSet(cmpFn);
            __super__.call(this)
          }
          return DistinctObserver
        }(AbstractObserver);
        observableProto.distinct = function (keySelector, comparer) {
          comparer || (comparer = defaultComparer);
          return new DistinctObservable(this, keySelector, comparer)
        };
        observableProto.groupBy = function (keySelector, elementSelector) {
          return this.groupByUntil(keySelector, elementSelector, observableNever)
        };
        observableProto.groupByUntil = function (keySelector, elementSelector, durationSelector) {
          var source = this;
          return new AnonymousObservable(source)
        };
        var MapObservable = function (__super__) {
          inherits(MapObservable, __super__);
          function MapObservable(source, selector, thisArg) {
            this.source = source;
            this.selector = bindCallback(selector, thisArg, 3);
            __super__.call(this)
          }
          MapObservable.prototype.internalMap = function (selector, thisArg) {
            return new MapObservable(this.source, innerMap(selector, this), thisArg)
          };
          MapObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new InnerObserver(o, this.selector, this))
          };
          inherits(InnerObserver, AbstractObserver);
          function InnerObserver(o, selector, source) {
            this.o = o;
            this.selector = selector;
            this.source = source;
            this.i = 0;
            AbstractObserver.call(this)
          }
          InnerObserver.prototype.next = function (x) {
            var result = tryCatch(this.selector)(x, this.i++, this.source);
            if (result === errorObj) {
              return this.o.onError(result.e)
            }
            this.o.onNext(result)
          };
          InnerObserver.prototype.error = function (e) {
            this.o.onError(e)
          };
          InnerObserver.prototype.completed = function () {
            this.o.onCompleted()
          };
          return MapObservable
        }(ObservableBase);
        observableProto.map = observableProto.select = function (selector, thisArg) {
          var selectorFn = typeof selector === 'function' ? selector : function () {
            return selector
          };
          return this instanceof MapObservable ? this.internalMap(selectorFn, thisArg) : new MapObservable(this, selectorFn, thisArg)
        };
        observableProto.pluck = function () {
          var len = arguments.length, args = new Array(len);
          if (len === 0) {
            throw new Error('List of properties cannot be empty.')
          }
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          return this.map(plucker(args, len))
        };
        observableProto.flatMap = observableProto.selectMany = observableProto.mergeMap = function (selector, resultSelector, thisArg) {
          return new FlatMapObservable(this, selector, resultSelector, thisArg).mergeAll()
        };
        observableProto.flatMapObserver = observableProto.selectManyObserver = function (onNext, onError, onCompleted, thisArg) {
          var source = this;
          return new AnonymousObservable(source).mergeAll()
        };
        observableProto.flatMapLatest = observableProto.switchMap = function (selector, resultSelector, thisArg) {
          return new FlatMapObservable(this, selector, resultSelector, thisArg).switchLatest()
        };
        var SkipObservable = function (__super__) {
          inherits(SkipObservable, __super__);
          function SkipObservable(source, count) {
            this.source = source;
            this._count = count;
            __super__.call(this)
          }
          function SkipObserver(o, c) {
            this._o = o;
            this._r = c;
            AbstractObserver.call(this)
          }
          inherits(SkipObserver, AbstractObserver);
          return SkipObservable
        }(ObservableBase);
        observableProto.skip = function (count) {
          if (count < 0) {
            throw new ArgumentOutOfRangeError()
          }
          return new SkipObservable(this, count)
        };
        var SkipWhileObservable = function (__super__) {
          inherits(SkipWhileObservable, __super__);
          function SkipWhileObservable(source, fn) {
            this.source = source;
            this._fn = fn;
            __super__.call(this)
          }
          return SkipWhileObservable
        }(ObservableBase);
        var SkipWhileObserver = function (__super__) {
          inherits(SkipWhileObserver, __super__);
          function SkipWhileObserver(o, p) {
            this._o = o;
            this._p = p;
            this._i = 0;
            this._r = false;
            __super__.call(this)
          }
          return SkipWhileObserver
        }(AbstractObserver);
        observableProto.skipWhile = function (predicate, thisArg) {
          var fn = bindCallback(predicate, thisArg, 3);
          return new SkipWhileObservable(this, fn)
        };
        var TakeObservable = function (__super__) {
          inherits(TakeObservable, __super__);
          function TakeObservable(source, count) {
            this.source = source;
            this._count = count;
            __super__.call(this)
          }
          function TakeObserver(o, c) {
            this._o = o;
            this._c = c;
            this._r = c;
            AbstractObserver.call(this)
          }
          inherits(TakeObserver, AbstractObserver);
          return TakeObservable
        }(ObservableBase);
        observableProto.take = function (count, scheduler) {
          if (count < 0) {
            throw new ArgumentOutOfRangeError()
          }
          if (count === 0) {
            return observableEmpty(scheduler)
          }
          return new TakeObservable(this, count)
        };
        var TakeWhileObservable = function (__super__) {
          inherits(TakeWhileObservable, __super__);
          function TakeWhileObservable(source, fn) {
            this.source = source;
            this._fn = fn;
            __super__.call(this)
          }
          return TakeWhileObservable
        }(ObservableBase);
        var TakeWhileObserver = function (__super__) {
          inherits(TakeWhileObserver, __super__);
          function TakeWhileObserver(o, p) {
            this._o = o;
            this._p = p;
            this._i = 0;
            this._r = true;
            __super__.call(this)
          }
          return TakeWhileObserver
        }(AbstractObserver);
        observableProto.takeWhile = function (predicate, thisArg) {
          var fn = bindCallback(predicate, thisArg, 3);
          return new TakeWhileObservable(this, fn)
        };
        var FilterObservable = function (__super__) {
          inherits(FilterObservable, __super__);
          function FilterObservable(source, predicate, thisArg) {
            this.source = source;
            this.predicate = bindCallback(predicate, thisArg, 3);
            __super__.call(this)
          }
          FilterObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new InnerObserver(o, this.predicate, this))
          };
          FilterObservable.prototype.internalFilter = function (predicate, thisArg) {
            return new FilterObservable(this.source, innerPredicate(predicate, this), thisArg)
          };
          inherits(InnerObserver, AbstractObserver);
          function InnerObserver(o, predicate, source) {
            this.o = o;
            this.predicate = predicate;
            this.source = source;
            this.i = 0;
            AbstractObserver.call(this)
          }
          InnerObserver.prototype.next = function (x) {
            var shouldYield = tryCatch(this.predicate)(x, this.i++, this.source);
            if (shouldYield === errorObj) {
              return this.o.onError(shouldYield.e)
            }
            shouldYield && this.o.onNext(x)
          };
          InnerObserver.prototype.error = function (e) {
            this.o.onError(e)
          };
          InnerObserver.prototype.completed = function () {
            this.o.onCompleted()
          };
          return FilterObservable
        }(ObservableBase);
        observableProto.filter = observableProto.where = function (predicate, thisArg) {
          return this instanceof FilterObservable ? this.internalFilter(predicate, thisArg) : new FilterObservable(this, predicate, thisArg)
        };
        var ExtremaByObservable = function (__super__) {
          inherits(ExtremaByObservable, __super__);
          function ExtremaByObservable(source, k, c) {
            this.source = source;
            this._k = k;
            this._c = c;
            __super__.call(this)
          }
          return ExtremaByObservable
        }(ObservableBase);
        var ExtremaByObserver = function (__super__) {
          inherits(ExtremaByObserver, __super__);
          function ExtremaByObserver(o, k, c) {
            this._o = o;
            this._k = k;
            this._c = c;
            this._v = null;
            this._hv = false;
            this._l = [];
            __super__.call(this)
          }
          return ExtremaByObserver
        }(AbstractObserver);
        var ReduceObservable = function (__super__) {
          inherits(ReduceObservable, __super__);
          function ReduceObservable(source, accumulator, hasSeed, seed) {
            this.source = source;
            this.accumulator = accumulator;
            this.hasSeed = hasSeed;
            this.seed = seed;
            __super__.call(this)
          }
          ReduceObservable.prototype.subscribeCore = function (observer) {
            return this.source.subscribe(new ReduceObserver(observer, this))
          };
          return ReduceObservable
        }(ObservableBase);
        var ReduceObserver = function (__super__) {
          inherits(ReduceObserver, __super__);
          function ReduceObserver(o, parent) {
            this._o = o;
            this._p = parent;
            this._fn = parent.accumulator;
            this._hs = parent.hasSeed;
            this._s = parent.seed;
            this._ha = false;
            this._a = null;
            this._hv = false;
            this._i = 0;
            __super__.call(this)
          }
          return ReduceObserver
        }(AbstractObserver);
        observableProto.reduce = function () {
          var hasSeed = false, seed, accumulator = arguments[0];
          if (arguments.length === 2) {
            hasSeed = true;
            seed = arguments[1]
          }
          return new ReduceObservable(this, accumulator, hasSeed, seed)
        };
        var SomeObservable = function (__super__) {
          inherits(SomeObservable, __super__);
          function SomeObservable(source, fn) {
            this.source = source;
            this._fn = fn;
            __super__.call(this)
          }
          return SomeObservable
        }(ObservableBase);
        var SomeObserver = function (__super__) {
          inherits(SomeObserver, __super__);
          function SomeObserver(o, fn, s) {
            this._o = o;
            this._fn = fn;
            this._s = s;
            this._i = 0;
            __super__.call(this)
          }
          return SomeObserver
        }(AbstractObserver);
        observableProto.some = function (predicate, thisArg) {
          var fn = bindCallback(predicate, thisArg, 3);
          return new SomeObservable(this, fn)
        };
        var IsEmptyObservable = function (__super__) {
          inherits(IsEmptyObservable, __super__);
          function IsEmptyObservable(source) {
            this.source = source;
            __super__.call(this)
          }
          return IsEmptyObservable
        }(ObservableBase);
        var IsEmptyObserver = function (__super__) {
          inherits(IsEmptyObserver, __super__);
          function IsEmptyObserver(o) {
            this._o = o;
            __super__.call(this)
          }
          return IsEmptyObserver
        }(AbstractObserver);
        observableProto.isEmpty = function () {
          return new IsEmptyObservable(this)
        };
        var EveryObservable = function (__super__) {
          inherits(EveryObservable, __super__);
          function EveryObservable(source, fn) {
            this.source = source;
            this._fn = fn;
            __super__.call(this)
          }
          return EveryObservable
        }(ObservableBase);
        var EveryObserver = function (__super__) {
          inherits(EveryObserver, __super__);
          function EveryObserver(o, fn, s) {
            this._o = o;
            this._fn = fn;
            this._s = s;
            this._i = 0;
            __super__.call(this)
          }
          return EveryObserver
        }(AbstractObserver);
        observableProto.every = function (predicate, thisArg) {
          var fn = bindCallback(predicate, thisArg, 3);
          return new EveryObservable(this, fn)
        };
        var IncludesObservable = function (__super__) {
          inherits(IncludesObservable, __super__);
          function IncludesObservable(source, elem, idx) {
            var n = +idx || 0;
            Math.abs(n) === Infinity && (n = 0);
            this.source = source;
            this._elem = elem;
            this._n = n;
            __super__.call(this)
          }
          return IncludesObservable
        }(ObservableBase);
        var IncludesObserver = function (__super__) {
          inherits(IncludesObserver, __super__);
          function IncludesObserver(o, elem, n) {
            this._o = o;
            this._elem = elem;
            this._n = n;
            this._i = 0;
            __super__.call(this)
          }
          IncludesObserver.prototype.completed = function () {
            this._o.onNext(false);
            this._o.onCompleted()
          };
          return IncludesObserver
        }(AbstractObserver);
        observableProto.includes = function (searchElement, fromIndex) {
          return new IncludesObservable(this, searchElement, fromIndex)
        };
        var CountObservable = function (__super__) {
          inherits(CountObservable, __super__);
          function CountObservable(source, fn) {
            this.source = source;
            this._fn = fn;
            __super__.call(this)
          }
          return CountObservable
        }(ObservableBase);
        var CountObserver = function (__super__) {
          inherits(CountObserver, __super__);
          function CountObserver(o, fn, s) {
            this._o = o;
            this._fn = fn;
            this._s = s;
            this._i = 0;
            this._c = 0;
            __super__.call(this)
          }
          return CountObserver
        }(AbstractObserver);
        observableProto.count = function (predicate, thisArg) {
          var fn = bindCallback(predicate, thisArg, 3);
          return new CountObservable(this, fn)
        };
        var IndexOfObservable = function (__super__) {
          inherits(IndexOfObservable, __super__);
          function IndexOfObservable(source, e, n) {
            this.source = source;
            this._e = e;
            this._n = n;
            __super__.call(this)
          }
          return IndexOfObservable
        }(ObservableBase);
        var IndexOfObserver = function (__super__) {
          inherits(IndexOfObserver, __super__);
          function IndexOfObserver(o, e, n) {
            this._o = o;
            this._e = e;
            this._n = n;
            this._i = 0;
            __super__.call(this)
          }
          return IndexOfObserver
        }(AbstractObserver);
        observableProto.indexOf = function (searchElement, fromIndex) {
          var n = +fromIndex || 0;
          Math.abs(n) === Infinity && (n = 0);
          return new IndexOfObservable(this, searchElement, n)
        };
        var SumObservable = function (__super__) {
          inherits(SumObservable, __super__);
          function SumObservable(source, fn) {
            this.source = source;
            this._fn = fn;
            __super__.call(this)
          }
          return SumObservable
        }(ObservableBase);
        var SumObserver = function (__super__) {
          inherits(SumObserver, __super__);
          function SumObserver(o, fn, s) {
            this._o = o;
            this._fn = fn;
            this._s = s;
            this._i = 0;
            this._c = 0;
            __super__.call(this)
          }
          return SumObserver
        }(AbstractObserver);
        observableProto.sum = function (keySelector, thisArg) {
          var fn = bindCallback(keySelector, thisArg, 3);
          return new SumObservable(this, fn)
        };
        observableProto.minBy = function (keySelector, comparer) {
          comparer || (comparer = defaultSubComparer);
          return new ExtremaByObservable(this, keySelector)
        };
        observableProto.min = function (comparer) {
          return this.minBy(identity, comparer).map(firstOnly)
        };
        observableProto.maxBy = function (keySelector, comparer) {
          comparer || (comparer = defaultSubComparer);
          return new ExtremaByObservable(this, keySelector, comparer)
        };
        observableProto.max = function (comparer) {
          return this.maxBy(identity, comparer).map(firstOnly)
        };
        var AverageObservable = function (__super__) {
          inherits(AverageObservable, __super__);
          function AverageObservable(source, fn) {
            this.source = source;
            this._fn = fn;
            __super__.call(this)
          }
          return AverageObservable
        }(ObservableBase);
        var AverageObserver = function (__super__) {
          inherits(AverageObserver, __super__);
          function AverageObserver(o, fn, s) {
            this._o = o;
            this._fn = fn;
            this._s = s;
            this._c = 0;
            this._t = 0;
            __super__.call(this)
          }
          return AverageObserver
        }(AbstractObserver);
        observableProto.average = function (keySelector, thisArg) {
          var source = this, fn;
          if (isFunction(keySelector)) {
            fn = bindCallback(keySelector, thisArg, 3)
          }
          return new AverageObservable(source, fn)
        };
        observableProto.sequenceEqual = function (second, comparer) {
          var first = this;
          comparer || (comparer = defaultComparer);
          return new AnonymousObservable(first)
        };
        var ElementAtObservable = function (__super__) {
          inherits(ElementAtObservable, __super__);
          function ElementAtObservable(source, i, d) {
            this.source = source;
            this._i = i;
            this._d = d;
            __super__.call(this)
          }
          return ElementAtObservable
        }(ObservableBase);
        var ElementAtObserver = function (__super__) {
          inherits(ElementAtObserver, __super__);
          function ElementAtObserver(o, i, d) {
            this._o = o;
            this._i = i;
            this._d = d;
            __super__.call(this)
          }
          return ElementAtObserver
        }(AbstractObserver);
        observableProto.elementAt = function (index, defaultValue) {
          if (index < 0) {
            throw new ArgumentOutOfRangeError()
          }
          return new ElementAtObservable(this, index, defaultValue)
        };
        var SingleObserver = function (__super__) {
          inherits(SingleObserver, __super__);
          function SingleObserver(o, obj, s) {
            this._o = o;
            this._obj = obj;
            this._s = s;
            this._i = 0;
            this._hv = false;
            this._v = null;
            __super__.call(this)
          }
          return SingleObserver
        }(AbstractObserver);
        observableProto.single = function (predicate, thisArg) {
          var obj = {}, source = this;
          if (typeof arguments[0] === 'object') {
            obj = arguments[0]
          } else {
            obj = {
              predicate: arguments[0],
              thisArg: arguments[1],
              defaultValue: arguments[2]
            }
          }
          if (isFunction(obj.predicate)) {
            var fn = obj.predicate;
            obj.predicate = bindCallback(fn, obj.thisArg, 3)
          }
          return new AnonymousObservable(source)
        };
        var FirstObservable = function (__super__) {
          inherits(FirstObservable, __super__);
          function FirstObservable(source, obj) {
            this.source = source;
            this._obj = obj;
            __super__.call(this)
          }
          FirstObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new FirstObserver(o, this._obj, this.source))
          };
          return FirstObservable
        }(ObservableBase);
        var FirstObserver = function (__super__) {
          inherits(FirstObserver, __super__);
          function FirstObserver(o, obj, s) {
            this._o = o;
            this._obj = obj;
            this._s = s;
            this._i = 0;
            __super__.call(this)
          }
          FirstObserver.prototype.next = function (x) {
            if (this._obj.predicate) {
              var res = tryCatch(this._obj.predicate)(x, this._i++, this._s);
              if (res === errorObj) {
                return this._o.onError(res.e)
              }
              if (Boolean(res)) {
                this._o.onNext(x);
                this._o.onCompleted()
              }
            } else if (!this._obj.predicate) {
              this._o.onNext(x);
              this._o.onCompleted()
            }
          };
          FirstObserver.prototype.error = function (e) {
            this._o.onError(e)
          };
          FirstObserver.prototype.completed = function () {
            if (this._obj.defaultValue === undefined) {
              this._o.onError(new EmptyError())
            } else {
              this._o.onNext(this._obj.defaultValue);
              this._o.onCompleted()
            }
          };
          return FirstObserver
        }(AbstractObserver);
        observableProto.first = function () {
          var obj = {}, source = this;
          if (typeof arguments[0] === 'object') {
            obj = arguments[0]
          } else {
            obj = {
              predicate: arguments[0],
              thisArg: arguments[1],
              defaultValue: arguments[2]
            }
          }
          if (isFunction(obj.predicate)) {
            var fn = obj.predicate;
            obj.predicate = bindCallback(fn, obj.thisArg, 3)
          }
          return new FirstObservable(this, obj)
        };
        var LastObservable = function (__super__) {
          inherits(LastObservable, __super__);
          function LastObservable(source, obj) {
            this.source = source;
            this._obj = obj;
            __super__.call(this)
          }
          return LastObservable
        }(ObservableBase);
        var LastObserver = function (__super__) {
          inherits(LastObserver, __super__);
          function LastObserver(o, obj, s) {
            this._o = o;
            this._obj = obj;
            this._s = s;
            this._i = 0;
            this._hv = false;
            this._v = null;
            __super__.call(this)
          }
          return LastObserver
        }(AbstractObserver);
        observableProto.last = function () {
          var obj = {}, source = this;
          if (typeof arguments[0] === 'object') {
            obj = arguments[0]
          } else {
            obj = {
              predicate: arguments[0],
              thisArg: arguments[1],
              defaultValue: arguments[2]
            }
          }
          if (isFunction(obj.predicate)) {
            var fn = obj.predicate;
            obj.predicate = bindCallback(fn, obj.thisArg, 3)
          }
          return new LastObservable(this, obj)
        };
        var FindValueObserver = function (__super__) {
          inherits(FindValueObserver, __super__);
          function FindValueObserver(observer, source, callback, yieldIndex) {
            this._o = observer;
            this._s = source;
            this._cb = callback;
            this._y = yieldIndex;
            this._i = 0;
            __super__.call(this)
          }
          return FindValueObserver
        }(AbstractObserver);
        observableProto.find = function (predicate, thisArg) {
          return findValue(this, predicate, thisArg, false)
        };
        observableProto.findIndex = function (predicate, thisArg) {
          return findValue(this, predicate, thisArg, true)
        };
        var ToSetObservable = function (__super__) {
          inherits(ToSetObservable, __super__);
          function ToSetObservable(source) {
            this.source = source;
            __super__.call(this)
          }
          return ToSetObservable
        }(ObservableBase);
        var ToSetObserver = function (__super__) {
          inherits(ToSetObserver, __super__);
          function ToSetObserver(o) {
            this._o = o;
            this._s = new root.Set();
            __super__.call(this)
          }
          return ToSetObserver
        }(AbstractObserver);
        observableProto.toSet = function () {
          if (typeof root.Set === 'undefined') {
            throw new TypeError()
          }
          return new ToSetObservable(this)
        };
        var ToMapObservable = function (__super__) {
          inherits(ToMapObservable, __super__);
          function ToMapObservable(source, k, e) {
            this.source = source;
            this._k = k;
            this._e = e;
            __super__.call(this)
          }
          return ToMapObservable
        }(ObservableBase);
        var ToMapObserver = function (__super__) {
          inherits(ToMapObserver, __super__);
          function ToMapObserver(o, k, e) {
            this._o = o;
            this._k = k;
            this._e = e;
            this._m = new root.Map();
            __super__.call(this)
          }
          return ToMapObserver
        }(AbstractObserver);
        observableProto.toMap = function (keySelector, elementSelector) {
          if (typeof root.Map === 'undefined') {
            throw new TypeError()
          }
          return new ToMapObservable(this, keySelector, elementSelector)
        };
        var SliceObservable = function (__super__) {
          inherits(SliceObservable, __super__);
          function SliceObservable(source, b, e) {
            this.source = source;
            this._b = b;
            this._e = e;
            __super__.call(this)
          }
          return SliceObservable
        }(ObservableBase);
        var SliceObserver = function (__super__) {
          inherits(SliceObserver, __super__);
          function SliceObserver(o, b, e) {
            this._o = o;
            this._b = b;
            this._e = e;
            this._i = 0;
            __super__.call(this)
          }
          return SliceObserver
        }(AbstractObserver);
        observableProto.slice = function (begin, end) {
          var start = begin || 0;
          if (start < 0) {
            throw new Rx.ArgumentOutOfRangeError()
          }
          if (typeof end === 'number' && end < start) {
            throw new Rx.ArgumentOutOfRangeError()
          }
          return new SliceObservable(this, start, end)
        };
        var LastIndexOfObservable = function (__super__) {
          inherits(LastIndexOfObservable, __super__);
          function LastIndexOfObservable(source, e, n) {
            this.source = source;
            this._e = e;
            this._n = n;
            __super__.call(this)
          }
          return LastIndexOfObservable
        }(ObservableBase);
        var LastIndexOfObserver = function (__super__) {
          inherits(LastIndexOfObserver, __super__);
          function LastIndexOfObserver(o, e, n) {
            this._o = o;
            this._e = e;
            this._n = n;
            this._v = 0;
            this._hv = false;
            this._i = 0;
            __super__.call(this)
          }
          return LastIndexOfObserver
        }(AbstractObserver);
        observableProto.lastIndexOf = function (searchElement, fromIndex) {
          var n = +fromIndex || 0;
          Math.abs(n) === Infinity && (n = 0);
          return new LastIndexOfObservable(this, searchElement, n)
        };
        Observable.wrap = function (fn) {
          function createObservable() {
            return Observable.spawn.call(this, fn.apply(this, arguments))
          }
          createObservable.__generatorFunction__ = fn;
          return createObservable
        };
        var spawn = Observable.spawn = function () {
          var gen = arguments[0], self = this, args = [];
          for (var i = 1, len = arguments.length; i < len; i++) {
            args.push(arguments[i])
          }
          return new AnonymousObservable()
        };
        function toObservable(obj) {
          if (!obj) {
            return obj
          }
          if (Observable.isObservable(obj)) {
            return obj
          }
          if (isPromise(obj)) {
            return Observable.fromPromise(obj)
          }
          if (isGeneratorFunction(obj) || isGenerator(obj)) {
            return spawn.call(this, obj)
          }
          if (isFunction(obj)) {
            return thunkToObservable.call(this, obj)
          }
          if (isArrayLike(obj) || isIterable(obj)) {
            return arrayToObservable.call(this, obj)
          }
          if (isObject(obj)) {
            return objectToObservable.call(this, obj)
          }
          return obj
        }
        function arrayToObservable(obj) {
          return Observable.from(obj).concatMap().toArray()
        }
        function objectToObservable(obj) {
          var results = new obj.constructor(), keys = Object.keys(obj), observables = [];
          for (var i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            var observable = toObservable.call(this, obj[key]);
            if (observable && Observable.isObservable(observable)) {
              defer(observable, key)
            } else {
              results[key] = obj[key]
            }
          }
          return Observable.forkJoin.apply(Observable, observables).map()
        }
        function thunkToObservable(fn) {
          var self = this;
          return new AnonymousObservable()
        }
        function isGeneratorFunction(obj) {
          var ctor = obj.constructor;
          if (!ctor) {
            return false
          }
          if (ctor.name === 'GeneratorFunction' || ctor.displayName === 'GeneratorFunction') {
            return true
          }
          return isGenerator(ctor.prototype)
        }
        Observable.start = function (func, context, scheduler) {
          return observableToAsync(func, context, scheduler)()
        };
        var observableToAsync = Observable.toAsync = function (func, context, scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return function () {
            var args = arguments, subject = new AsyncSubject();
            scheduler.schedule(null);
            return subject.asObservable()
          }
        };
        function createCbObservable(fn, ctx, selector, args) {
          var o = new AsyncSubject();
          args.push(createCbHandler(o, ctx, selector));
          fn.apply(ctx, args);
          return o.asObservable()
        }
        Observable.fromCallback = function (fn, ctx, selector) {
          return function () {
            typeof ctx === 'undefined' && (ctx = this);
            var len = arguments.length, args = new Array(len);
            for (var i = 0; i < len; i++) {
              args[i] = arguments[i]
            }
            return createCbObservable(fn, ctx, selector, args)
          }
        };
        function createNodeObservable(fn, ctx, selector, args) {
          var o = new AsyncSubject();
          args.push(createNodeHandler(o, ctx, selector));
          fn.apply(ctx, args);
          return o.asObservable()
        }
        Observable.fromNodeCallback = function (fn, ctx, selector) {
          return function () {
            typeof ctx === 'undefined' && (ctx = this);
            var len = arguments.length, args = new Array(len);
            for (var i = 0; i < len; i++) {
              args[i] = arguments[i]
            }
            return createNodeObservable(fn, ctx, selector, args)
          }
        };
        function ListenDisposable(e, n, fn) {
          this._e = e;
          this._n = n;
          this._fn = fn;
          this._e.addEventListener(this._n, this._fn, false);
          this.isDisposed = false
        }
        function createEventListener(el, eventName, handler) {
          var disposables = new CompositeDisposable();
          var elemToString = Object.prototype.toString.call(el);
          if (isNodeList(el) || elemToString === '[object HTMLCollection]') {
            for (var i = 0, len = el.length; i < len; i++) {
              disposables.add(createEventListener(el.item(i), eventName, handler))
            }
          } else if (el) {
            disposables.add(new ListenDisposable(el, eventName, handler))
          }
          return disposables
        }
        Rx.config.useNativeEvents = false;
        var EventObservable = function (__super__) {
          inherits(EventObservable, __super__);
          function EventObservable(el, name, fn) {
            this._el = el;
            this._n = name;
            this._fn = fn;
            __super__.call(this)
          }
          return EventObservable
        }(ObservableBase);
        Observable.fromEvent = function (element, eventName, selector) {
          if (element.addListener) {
            return fromEventPattern(function (h) {
              element.addListener(eventName, h)
            }, function (h) {
              element.removeListener(eventName, h)
            }, selector)
          }
          if (!Rx.config.useNativeEvents) {
            if (typeof element.on === 'function' && typeof element.off === 'function') {
              return fromEventPattern(function (h) {
                element.on(eventName, h)
              }, function (h) {
                element.off(eventName, h)
              }, selector)
            }
          }
          return new EventObservable(element, eventName, selector).publish().refCount()
        };
        var EventPatternObservable = function (__super__) {
          inherits(EventPatternObservable, __super__);
          function EventPatternObservable(add, del, fn) {
            this._add = add;
            this._del = del;
            this._fn = fn;
            __super__.call(this)
          }
          function EventPatternDisposable(del, fn, ret) {
            this._del = del;
            this._fn = fn;
            this._ret = ret;
            this.isDisposed = false
          }
          return EventPatternObservable
        }(ObservableBase);
        var fromEventPattern = Observable.fromEventPattern = function (addHandler, removeHandler, selector) {
          return new EventPatternObservable(addHandler, removeHandler, selector).publish().refCount()
        };
        Observable.startAsync = function (functionAsync) {
          var promise = tryCatch(functionAsync)();
          if (promise === errorObj) {
            return observableThrow(promise.e)
          }
          return observableFromPromise(promise)
        };
        var PausableObservable = function (__super__) {
          inherits(PausableObservable, __super__);
          function PausableObservable(source, pauser) {
            this.source = source;
            this.controller = new Subject();
            this.paused = true;
            if (pauser && pauser.subscribe) {
              this.pauser = this.controller.merge(pauser)
            } else {
              this.pauser = this.controller
            }
            __super__.call(this)
          }
          return PausableObservable
        }(Observable);
        observableProto.pausable = function (pauser) {
          return new PausableObservable(this, pauser)
        };
        var PausableBufferedObservable = function (__super__) {
          inherits(PausableBufferedObservable, __super__);
          function PausableBufferedObservable(source, pauser) {
            this.source = source;
            this.controller = new Subject();
            this.paused = true;
            if (pauser && pauser.subscribe) {
              this.pauser = this.controller.merge(pauser)
            } else {
              this.pauser = this.controller
            }
            __super__.call(this)
          }
          PausableBufferedObservable.prototype._subscribe = function (o) {
            var q = [], previousShouldFire;
            function drainQueue() {
              while (q.length > 0) {
                o.onNext(q.shift())
              }
            }
            var subscription = combineLatestSource(this.source, this.pauser.startWith(!this.paused).distinctUntilChanged(), function (data, shouldFire) {
              return {
                data: data,
                shouldFire: shouldFire
              }
            }).subscribe(function (results) {
              if (previousShouldFire !== undefined && results.shouldFire !== previousShouldFire) {
                previousShouldFire = results.shouldFire;
                if (results.shouldFire) {
                  drainQueue()
                }
              } else {
                previousShouldFire = results.shouldFire;
                if (results.shouldFire) {
                  o.onNext(results.data)
                } else {
                  q.push(results.data)
                }
              }
            }, function (err) {
              drainQueue();
              o.onError(err)
            }, function () {
              drainQueue();
              o.onCompleted()
            });
            return subscription
          };
          PausableBufferedObservable.prototype.pause = function () {
            this.paused = true;
            this.controller.onNext(false)
          };
          PausableBufferedObservable.prototype.resume = function () {
            this.paused = false;
            this.controller.onNext(true)
          };
          return PausableBufferedObservable
        }(Observable);
        observableProto.pausableBuffered = function (pauser) {
          return new PausableBufferedObservable(this, pauser)
        };
        var ControlledObservable = function (__super__) {
          inherits(ControlledObservable, __super__);
          function ControlledObservable(source, enableQueue, scheduler) {
            __super__.call(this);
            this.subject = new ControlledSubject(enableQueue, scheduler);
            this.source = source.multicast(this.subject).refCount()
          }
          return ControlledObservable
        }(Observable);
        var ControlledSubject = function (__super__) {
          inherits(ControlledSubject, __super__);
          function ControlledSubject(enableQueue, scheduler) {
            enableQueue == null && (enableQueue = true);
            __super__.call(this);
            this.subject = new Subject();
            this.enableQueue = enableQueue;
            this.queue = enableQueue ? [] : null;
            this.requestedCount = 0;
            this.requestedDisposable = null;
            this.error = null;
            this.hasFailed = false;
            this.hasCompleted = false;
            this.scheduler = scheduler || currentThreadScheduler
          }
          addProperties(ControlledSubject.prototype, Observer, {
            _subscribe: function (o) {
              return this.subject.subscribe(o)
            },
            onCompleted: function () {
              this.hasCompleted = true;
              if (!this.enableQueue || this.queue.length === 0) {
                this.subject.onCompleted();
                this.disposeCurrentRequest()
              } else {
                this.queue.push(Notification.createOnCompleted())
              }
            },
            onError: function (error) {
              this.hasFailed = true;
              this.error = error;
              if (!this.enableQueue || this.queue.length === 0) {
                this.subject.onError(error);
                this.disposeCurrentRequest()
              } else {
                this.queue.push(Notification.createOnError(error))
              }
            },
            onNext: function (value) {
              if (this.requestedCount <= 0) {
                this.enableQueue && this.queue.push(Notification.createOnNext(value))
              } else {
                this.requestedCount-- === 0 && this.disposeCurrentRequest();
                this.subject.onNext(value)
              }
            },
            _processRequest: function (numberOfItems) {
              if (this.enableQueue) {
                while (this.queue.length > 0 && (numberOfItems > 0 || this.queue[0].kind !== 'N')) {
                  var first = this.queue.shift();
                  first.accept(this.subject);
                  if (first.kind === 'N') {
                    numberOfItems--
                  } else {
                    this.disposeCurrentRequest();
                    this.queue = []
                  }
                }
              }
              return numberOfItems
            },
            request: function (number) {
              this.disposeCurrentRequest();
              var self = this;
              this.requestedDisposable = this.scheduler.schedule(number, function (s, i) {
                var remaining = self._processRequest(i);
                var stopped = self.hasCompleted || self.hasFailed;
                if (!stopped && remaining > 0) {
                  self.requestedCount = remaining;
                  return disposableCreate(function () {
                    self.requestedCount = 0
                  })
                }
              });
              return this.requestedDisposable
            },
            disposeCurrentRequest: function () {
              if (this.requestedDisposable) {
                this.requestedDisposable.dispose();
                this.requestedDisposable = null
              }
            }
          });
          return ControlledSubject
        }(Observable);
        observableProto.controlled = function (enableQueue, scheduler) {
          if (enableQueue && isScheduler(enableQueue)) {
            scheduler = enableQueue;
            enableQueue = true
          }
          if (enableQueue == null) {
            enableQueue = true
          }
          return new ControlledObservable(this, enableQueue, scheduler)
        };
        var StopAndWaitObservable = function (__super__) {
          inherits(StopAndWaitObservable, __super__);
          function StopAndWaitObservable(source) {
            __super__.call(this);
            this.source = source
          }
          var StopAndWaitObserver = function (__sub__) {
            inherits(StopAndWaitObserver, __sub__);
            function StopAndWaitObserver(observer, observable, cancel) {
              __sub__.call(this);
              this.observer = observer;
              this.observable = observable;
              this.cancel = cancel;
              this.scheduleDisposable = null
            }
            StopAndWaitObserver.prototype.next = function (value) {
              this.observer.onNext(value);
              this.scheduleDisposable = defaultScheduler.schedule(this, innerScheduleMethod)
            };
            StopAndWaitObserver.dispose = function () {
              this.observer = null;
              if (this.cancel) {
                this.cancel.dispose();
                this.cancel = null
              }
              if (this.scheduleDisposable) {
                this.scheduleDisposable.dispose();
                this.scheduleDisposable = null
              }
              __sub__.prototype.dispose.call(this)
            };
            return StopAndWaitObserver
          }(AbstractObserver);
          return StopAndWaitObservable
        }(Observable);
        var WindowedObservable = function (__super__) {
          inherits(WindowedObservable, __super__);
          function WindowedObservable(source, windowSize) {
            __super__.call(this);
            this.source = source;
            this.windowSize = windowSize
          }
          function scheduleMethod(s, self) {
            return self.source.request(self.windowSize)
          }
          WindowedObservable.prototype._subscribe = function (o) {
            this.subscription = this.source.subscribe(new WindowedObserver(o, this, this.subscription));
            return new BinaryDisposable(this.subscription, defaultScheduler.schedule(this, scheduleMethod))
          };
          var WindowedObserver = function (__sub__) {
            inherits(WindowedObserver, __sub__);
            function WindowedObserver(observer, observable, cancel) {
              this.observer = observer;
              this.observable = observable;
              this.cancel = cancel;
              this.received = 0;
              this.scheduleDisposable = null;
              __sub__.call(this)
            }
            WindowedObserver.prototype.completed = function () {
              this.observer.onCompleted();
              this.dispose()
            };
            WindowedObserver.prototype.error = function (error) {
              this.observer.onError(error);
              this.dispose()
            };
            function innerScheduleMethod(s, self) {
              return self.observable.source.request(self.observable.windowSize)
            }
            WindowedObserver.prototype.next = function (value) {
              this.observer.onNext(value);
              this.received = ++this.received % this.observable.windowSize;
              this.received === 0 && (this.scheduleDisposable = defaultScheduler.schedule(this, innerScheduleMethod))
            };
            WindowedObserver.prototype.dispose = function () {
              this.observer = null;
              if (this.cancel) {
                this.cancel.dispose();
                this.cancel = null
              }
              if (this.scheduleDisposable) {
                this.scheduleDisposable.dispose();
                this.scheduleDisposable = null
              }
              __sub__.prototype.dispose.call(this)
            };
            return WindowedObserver
          }(AbstractObserver);
          return WindowedObservable
        }(Observable);
        observableProto.pipe = function (dest) {
          var source = this.pausableBuffered();
          function onDrain() {
            source.resume()
          }
          dest.addListener('drain', onDrain);
          source.subscribe(function (x) {
            !dest.write(x) && source.pause()
          }, function (err) {
            dest.emit('error', err)
          }, function () {
            !dest._isStdio && dest.end();
            dest.removeListener('drain', onDrain)
          });
          source.resume();
          return dest
        };
        var MulticastObservable = function (__super__) {
          inherits(MulticastObservable, __super__);
          function MulticastObservable(source, fn1, fn2) {
            this.source = source;
            this._fn1 = fn1;
            this._fn2 = fn2;
            __super__.call(this)
          }
          return MulticastObservable
        }(ObservableBase);
        observableProto.multicast = function (subjectOrSubjectSelector, selector) {
          return isFunction(subjectOrSubjectSelector) ? new MulticastObservable(this, subjectOrSubjectSelector, selector) : new ConnectableObservable(this, subjectOrSubjectSelector)
        };
        observableProto.publish = function (selector) {
          return selector && isFunction(selector) ? this.multicast(function () {
            return new Subject()
          }, selector) : this.multicast(new Subject())
        };
        observableProto.share = function () {
          return this.publish().refCount()
        };
        observableProto.publishLast = function (selector) {
          return selector && isFunction(selector) ? this.multicast(function () {
            return new AsyncSubject()
          }, selector) : this.multicast(new AsyncSubject())
        };
        observableProto.publishValue = function (initialValueOrSelector, initialValue) {
          return arguments.length === 2 ? this.multicast(function () {
            return new BehaviorSubject(initialValue)
          }, initialValueOrSelector) : this.multicast(new BehaviorSubject(initialValueOrSelector))
        };
        observableProto.shareValue = function (initialValue) {
          return this.publishValue(initialValue).refCount()
        };
        observableProto.replay = function (selector, bufferSize, windowSize, scheduler) {
          return selector && isFunction(selector) ? this.multicast(function () {
            return new ReplaySubject(bufferSize, windowSize, scheduler)
          }, selector) : this.multicast(new ReplaySubject(bufferSize, windowSize, scheduler))
        };
        observableProto.shareReplay = function (bufferSize, windowSize, scheduler) {
          return this.replay(null, bufferSize, windowSize, scheduler).refCount()
        };
        var InnerSubscription = function (s, o) {
          this._s = s;
          this._o = o
        };
        InnerSubscription.prototype.dispose = function () {
          if (!this._s.isDisposed && this._o !== null) {
            var idx = this._s.observers.indexOf(this._o);
            this._s.observers.splice(idx, 1);
            this._o = null
          }
        };
        var RefCountObservable = function (__super__) {
          inherits(RefCountObservable, __super__);
          function RefCountObservable(source) {
            this.source = source;
            this._count = 0;
            this._connectableSubscription = null;
            __super__.call(this)
          }
          RefCountObservable.prototype.subscribeCore = function (o) {
            var subscription = this.source.subscribe(o);
            ++this._count === 1 && (this._connectableSubscription = this.source.connect());
            return new RefCountDisposable(this, subscription)
          };
          function RefCountDisposable(p, s) {
            this._p = p;
            this._s = s;
            this.isDisposed = false
          }
          return RefCountObservable
        }(ObservableBase);
        var ConnectableObservable = Rx.ConnectableObservable = function (__super__) {
          inherits(ConnectableObservable, __super__);
          function ConnectableObservable(source, subject) {
            this.source = source;
            this._connection = null;
            this._source = source.asObservable();
            this._subject = subject;
            __super__.call(this)
          }
          function ConnectDisposable(parent, subscription) {
            this._p = parent;
            this._s = subscription
          }
          ConnectDisposable.prototype.dispose = function () {
            if (this._s) {
              this._s.dispose();
              this._s = null;
              this._p._connection = null
            }
          };
          ConnectableObservable.prototype.connect = function () {
            if (!this._connection) {
              if (this._subject.isStopped) {
                return disposableEmpty
              }
              var subscription = this._source.subscribe(this._subject);
              this._connection = new ConnectDisposable(this, subscription)
            }
            return this._connection
          };
          ConnectableObservable.prototype._subscribe = function (o) {
            return this._subject.subscribe(o)
          };
          ConnectableObservable.prototype.refCount = function () {
            return new RefCountObservable(this)
          };
          return ConnectableObservable
        }(Observable);
        observableProto.singleInstance = function () {
          var source = this, hasObservable = false, observable;
          function getObservable() {
            if (!hasObservable) {
              hasObservable = true;
              observable = source['finally'](function () {
                hasObservable = false
              }).publish().refCount()
            }
            return observable
          }
          return new AnonymousObservable()
        };
        observableProto.join = function (right, leftDurationSelector, rightDurationSelector, resultSelector) {
          var left = this;
          return new AnonymousObservable(left)
        };
        observableProto.groupJoin = function (right, leftDurationSelector, rightDurationSelector, resultSelector) {
          var left = this;
          return new AnonymousObservable(left)
        };
        observableProto.buffer = function () {
          return this.window.apply(this, arguments).flatMap(toArray)
        };
        observableProto.window = function (windowOpeningsOrClosingSelector, windowClosingSelector) {
          if (arguments.length === 1 && typeof arguments[0] !== 'function') {
            return observableWindowWithBoundaries.call(this, windowOpeningsOrClosingSelector)
          }
          return typeof windowOpeningsOrClosingSelector === 'function' ? observableWindowWithClosingSelector.call(this, windowOpeningsOrClosingSelector) : observableWindowWithOpenings.call(this, windowOpeningsOrClosingSelector, windowClosingSelector)
        };
        function observableWindowWithBoundaries(windowBoundaries) {
          var source = this;
          return new AnonymousObservable(function (observer) {
            var win = new Subject(), d = new CompositeDisposable(), r = new RefCountDisposable(d);
            observer.onNext(addRef(win, r));
            d.add(source.subscribe(function (x) {
              win.onNext(x)
            }, function (err) {
              win.onError(err);
              observer.onError(err)
            }, function () {
              win.onCompleted();
              observer.onCompleted()
            }));
            isPromise(windowBoundaries) && (windowBoundaries = observableFromPromise(windowBoundaries));
            d.add(windowBoundaries.subscribe(function (w) {
              win.onCompleted();
              win = new Subject();
              observer.onNext(addRef(win, r))
            }, function (err) {
              win.onError(err);
              observer.onError(err)
            }, function () {
              win.onCompleted();
              observer.onCompleted()
            }));
            return r
          }, source)
        }
        var PairwiseObservable = function (__super__) {
          inherits(PairwiseObservable, __super__);
          function PairwiseObservable(source) {
            this.source = source;
            __super__.call(this)
          }
          PairwiseObservable.prototype.subscribeCore = function (o) {
            return this.source.subscribe(new PairwiseObserver(o))
          };
          return PairwiseObservable
        }(ObservableBase);
        var PairwiseObserver = function (__super__) {
          inherits(PairwiseObserver, __super__);
          function PairwiseObserver(o) {
            this._o = o;
            this._p = null;
            this._hp = false;
            __super__.call(this)
          }
          PairwiseObserver.prototype.next = function (x) {
            if (this._hp) {
              this._o.onNext([
                this._p,
                x
              ])
            } else {
              this._hp = true
            }
            this._p = x
          };
          PairwiseObserver.prototype.error = function (err) {
            this._o.onError(err)
          };
          PairwiseObserver.prototype.completed = function () {
            this._o.onCompleted()
          };
          return PairwiseObserver
        }(AbstractObserver);
        observableProto.pairwise = function () {
          return new PairwiseObservable(this)
        };
        observableProto.partition = function (predicate, thisArg) {
          var fn = bindCallback(predicate, thisArg, 3);
          return [
            this.filter(predicate, thisArg),
            this.filter()
          ]
        };
        var WhileEnumerable = function (__super__) {
          inherits(WhileEnumerable, __super__);
          function WhileEnumerable(c, s) {
            this.c = c;
            this.s = s
          }
          return WhileEnumerable
        }(Enumerable);
        observableProto.letBind = observableProto['let'] = function (func) {
          return func(this)
        };
        Observable['if'] = function (condition, thenSource, elseSourceOrScheduler) {
          return observableDefer()
        };
        Observable['for'] = Observable.forIn = function (sources, resultSelector, thisArg) {
          return enumerableOf(sources, resultSelector, thisArg).concat()
        };
        var observableWhileDo = Observable['while'] = Observable.whileDo = function (condition, source) {
          isPromise(source) && (source = observableFromPromise(source));
          return enumerableWhile(condition, source).concat()
        };
        observableProto.doWhile = function (condition) {
          return observableConcat([
            this,
            observableWhileDo(condition, this)
          ])
        };
        Observable['case'] = function (selector, sources, defaultSourceOrScheduler) {
          return observableDefer()
        };
        var ExpandObservable = function (__super__) {
          inherits(ExpandObservable, __super__);
          function ExpandObservable(source, fn, scheduler) {
            this.source = source;
            this._fn = fn;
            this._scheduler = scheduler;
            __super__.call(this)
          }
          return ExpandObservable
        }(ObservableBase);
        var ExpandObserver = function (__super__) {
          inherits(ExpandObserver, __super__);
          function ExpandObserver(state, parent, m1) {
            this._s = state;
            this._p = parent;
            this._m1 = m1;
            __super__.call(this)
          }
          return ExpandObserver
        }(AbstractObserver);
        observableProto.expand = function (selector, scheduler) {
          isScheduler(scheduler) || (scheduler = currentThreadScheduler);
          return new ExpandObservable(this, selector, scheduler)
        };
        var ForkJoinObservable = function (__super__) {
          inherits(ForkJoinObservable, __super__);
          function ForkJoinObservable(sources, cb) {
            this._sources = sources;
            this._cb = cb;
            __super__.call(this)
          }
          ForkJoinObservable.prototype.subscribeCore = function (o) {
            if (this._sources.length === 0) {
              o.onCompleted();
              return disposableEmpty
            }
            var count = this._sources.length;
            var state = {
              finished: false,
              hasResults: new Array(count),
              hasCompleted: new Array(count),
              results: new Array(count)
            };
            var subscriptions = new CompositeDisposable();
            for (var i = 0, len = this._sources.length; i < len; i++) {
              var source = this._sources[i];
              isPromise(source) && (source = observableFromPromise(source));
              subscriptions.add(source.subscribe(new ForkJoinObserver(o, state, i, this._cb, subscriptions)))
            }
            return subscriptions
          };
          return ForkJoinObservable
        }(ObservableBase);
        var ForkJoinObserver = function (__super__) {
          inherits(ForkJoinObserver, __super__);
          function ForkJoinObserver(o, s, i, cb, subs) {
            this._o = o;
            this._s = s;
            this._i = i;
            this._cb = cb;
            this._subs = subs;
            __super__.call(this)
          }
          return ForkJoinObserver
        }(AbstractObserver);
        Observable.forkJoin = function () {
          var len = arguments.length, args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          var resultSelector = isFunction(args[len - 1]) ? args.pop() : argumentsToArray;
          Array.isArray(args[0]) && (args = args[0]);
          return new ForkJoinObservable(args, resultSelector)
        };
        observableProto.forkJoin = function () {
          var len = arguments.length, args = new Array(len);
          for (var i = 0; i < len; i++) {
            args[i] = arguments[i]
          }
          if (Array.isArray(args[0])) {
            args[0].unshift(this)
          } else {
            args.unshift(this)
          }
          return Observable.forkJoin.apply(null, args)
        };
        observableProto.manySelect = observableProto.extend = function (selector, scheduler) {
          isScheduler(scheduler) || (scheduler = Rx.Scheduler.immediate);
          var source = this;
          return observableDefer(source)
        };
        var ChainObservable = function (__super__) {
          inherits(ChainObservable, __super__);
          function ChainObservable(head) {
            __super__.call(this);
            this.head = head;
            this.tail = new AsyncSubject()
          }
          addProperties(ChainObservable.prototype, Observer, {
            _subscribe: function (o) {
              var g = new CompositeDisposable();
              g.add(currentThreadScheduler.schedule(this, function (_, self) {
                o.onNext(self.head);
                g.add(self.tail.mergeAll().subscribe(o))
              }));
              return g
            },
            onCompleted: function () {
              this.onNext(Observable.empty())
            },
            onError: function (e) {
              this.onNext(Observable['throw'](e))
            },
            onNext: function (v) {
              this.tail.onNext(v);
              this.tail.onCompleted()
            }
          });
          return ChainObservable
        }(Observable);
        var Map = root.Map || function () {
          Map.prototype.set = function (key, value) {
            var i = this._keys.indexOf(key);
            if (i === -1) {
              this._keys.push(key);
              this._values.push(value);
              this.size++
            } else {
              this._values[i] = value
            }
            return this
          };
          return Map
        }();
        function Pattern(patterns) {
          this.patterns = patterns
        }
        Pattern.prototype.thenDo = function (selector) {
          return new Plan(this, selector)
        };
        function Plan(expression, selector) {
          this.expression = expression;
          this.selector = selector
        }
        function handleOnNext(self, observer) {
          return function onNext() {
            var result = tryCatch(self.selector).apply(self, arguments);
            if (result === errorObj) {
              return observer.onError(result.e)
            }
            observer.onNext(result)
          }
        }
        function planCreateObserver(externalSubscriptions, observable, onError) {
          var entry = externalSubscriptions.get(observable);
          if (!entry) {
            var observer = new JoinObserver(observable, onError);
            externalSubscriptions.set(observable, observer);
            return observer
          }
          return entry
        }
        function ActivePlan(joinObserverArray, onNext, onCompleted) {
          this.joinObserverArray = joinObserverArray;
          this.onNext = onNext;
          this.onCompleted = onCompleted;
          this.joinObservers = new Map();
          for (var i = 0, len = this.joinObserverArray.length; i < len; i++) {
            var joinObserver = this.joinObserverArray[i];
            this.joinObservers.set(joinObserver, joinObserver)
          }
        }
        ActivePlan.prototype.match = function () {
          var i, len, hasValues = true;
          for (i = 0, len = this.joinObserverArray.length; i < len; i++) {
            if (this.joinObserverArray[i].queue.length === 0) {
              hasValues = false;
              break
            }
          }
          if (hasValues) {
            var firstValues = [], isCompleted = false;
            for (i = 0, len = this.joinObserverArray.length; i < len; i++) {
              firstValues.push(this.joinObserverArray[i].queue[0]);
              this.joinObserverArray[i].queue[0].kind === 'C' && (isCompleted = true)
            }
            if (isCompleted) {
              this.onCompleted()
            } else {
              this.dequeue();
              var values = [];
              for (i = 0, len = firstValues.length; i < firstValues.length; i++) {
                values.push(firstValues[i].value)
              }
              this.onNext.apply(this, values)
            }
          }
        };
        var JoinObserver = function (__super__) {
          inherits(JoinObserver, __super__);
          function JoinObserver(source, onError) {
            __super__.call(this);
            this.source = source;
            this.onError = onError;
            this.queue = [];
            this.activePlans = [];
            this.subscription = new SingleAssignmentDisposable();
            this.isDisposed = false
          }
          var JoinObserverPrototype = JoinObserver.prototype;
          JoinObserverPrototype.next = function (notification) {
            if (!this.isDisposed) {
              if (notification.kind === 'E') {
                return this.onError(notification.error)
              }
              this.queue.push(notification);
              var activePlans = this.activePlans.slice(0);
              for (var i = 0, len = activePlans.length; i < len; i++) {
                activePlans[i].match()
              }
            }
          };
          JoinObserverPrototype.error = noop;
          JoinObserverPrototype.completed = noop;
          JoinObserverPrototype.addActivePlan = function (activePlan) {
            this.activePlans.push(activePlan)
          };
          JoinObserverPrototype.subscribe = function () {
            this.subscription.setDisposable(this.source.materialize().subscribe(this))
          };
          JoinObserverPrototype.removeActivePlan = function (activePlan) {
            this.activePlans.splice(this.activePlans.indexOf(activePlan), 1);
            this.activePlans.length === 0 && this.dispose()
          };
          JoinObserverPrototype.dispose = function () {
            __super__.prototype.dispose.call(this);
            if (!this.isDisposed) {
              this.isDisposed = true;
              this.subscription.dispose()
            }
          };
          return JoinObserver
        }(AbstractObserver);
        observableProto.and = function (right) {
          return new Pattern([
            this,
            right
          ])
        };
        observableProto.thenDo = function (selector) {
          return new Pattern([this]).thenDo(selector)
        };
        Observable.when = function () {
          var len = arguments.length, plans;
          if (Array.isArray(arguments[0])) {
            plans = arguments[0]
          } else {
            plans = new Array(len);
            for (var i = 0; i < len; i++) {
              plans[i] = arguments[i]
            }
          }
          return new AnonymousObservable()
        };
        var TimerObservable = function (__super__) {
          inherits(TimerObservable, __super__);
          function TimerObservable(dt, s) {
            this._dt = dt;
            this._s = s;
            __super__.call(this)
          }
          return TimerObservable
        }(ObservableBase);
        function observableTimerDateAndPeriod(dueTime, period, scheduler) {
          return new AnonymousObservable(function (observer) {
            var d = dueTime, p = normalizeTime(period);
            return scheduler.scheduleRecursiveFuture(0, d, function (count, self) {
              if (p > 0) {
                var now = scheduler.now();
                d = new Date(d.getTime() + p);
                d.getTime() <= now && (d = new Date(now + p))
              }
              observer.onNext(count);
              self(count + 1, new Date(d))
            })
          })
        }
        var observableinterval = Observable.interval = function (period, scheduler) {
          return observableTimerTimeSpanAndPeriod(period, period, isScheduler(scheduler) ? scheduler : defaultScheduler)
        };
        var observableTimer = Observable.timer = function (dueTime, periodOrScheduler, scheduler) {
          var period;
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          if (periodOrScheduler != null && typeof periodOrScheduler === 'number') {
            period = periodOrScheduler
          } else if (isScheduler(periodOrScheduler)) {
            scheduler = periodOrScheduler
          }
          if ((dueTime instanceof Date || typeof dueTime === 'number') && period === undefined) {
            return _observableTimer(dueTime, scheduler)
          }
          if (dueTime instanceof Date && period !== undefined) {
            return observableTimerDateAndPeriod(dueTime, periodOrScheduler, scheduler)
          }
          return observableTimerTimeSpanAndPeriod(dueTime, period, scheduler)
        };
        function observableDelayAbsolute(source, dueTime, scheduler) {
          return observableDefer(function () {
            return observableDelayRelative(source, dueTime - scheduler.now(), scheduler)
          })
        }
        observableProto.delay = function () {
          var firstArg = arguments[0];
          if (typeof firstArg === 'number' || firstArg instanceof Date) {
            var dueTime = firstArg, scheduler = arguments[1];
            isScheduler(scheduler) || (scheduler = defaultScheduler);
            return dueTime instanceof Date ? observableDelayAbsolute(this, dueTime, scheduler) : observableDelayRelative(this, dueTime, scheduler)
          } else if (Observable.isObservable(firstArg) || isFunction(firstArg)) {
            return delayWithSelector(this, firstArg, arguments[1])
          } else {
            throw new Error('Invalid arguments')
          }
        };
        var DebounceObservable = function (__super__) {
          inherits(DebounceObservable, __super__);
          function DebounceObservable(source, dt, s) {
            isScheduler(s) || (s = defaultScheduler);
            this.source = source;
            this._dt = dt;
            this._s = s;
            __super__.call(this)
          }
          return DebounceObservable
        }(ObservableBase);
        var DebounceObserver = function (__super__) {
          inherits(DebounceObserver, __super__);
          function DebounceObserver(observer, dueTime, scheduler, cancelable) {
            this._o = observer;
            this._d = dueTime;
            this._scheduler = scheduler;
            this._c = cancelable;
            this._v = null;
            this._hv = false;
            this._id = 0;
            __super__.call(this)
          }
          DebounceObserver.prototype.completed = function () {
            this._c.dispose();
            this._hv && this._o.onNext(this._v);
            this._o.onCompleted();
            this._hv = false;
            this._id++
          };
          return DebounceObserver
        }(AbstractObserver);
        observableProto.debounce = function () {
          if (isFunction(arguments[0])) {
            return debounceWithSelector(this, arguments[0])
          } else if (typeof arguments[0] === 'number') {
            return new DebounceObservable(this, arguments[0], arguments[1])
          } else {
            throw new Error('Invalid arguments')
          }
        };
        observableProto.windowWithTime = observableProto.windowTime = function (timeSpan, timeShiftOrScheduler, scheduler) {
          var source = this, timeShift;
          timeShiftOrScheduler == null && (timeShift = timeSpan);
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          if (typeof timeShiftOrScheduler === 'number') {
            timeShift = timeShiftOrScheduler
          } else if (isScheduler(timeShiftOrScheduler)) {
            timeShift = timeSpan;
            scheduler = timeShiftOrScheduler
          }
          return new AnonymousObservable(source)
        };
        observableProto.windowWithTimeOrCount = observableProto.windowTimeOrCount = function (timeSpan, count, scheduler) {
          var source = this;
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return new AnonymousObservable(source)
        };
        observableProto.bufferWithTime = observableProto.bufferTime = function (timeSpan, timeShiftOrScheduler, scheduler) {
          return this.windowWithTime(timeSpan, timeShiftOrScheduler, scheduler).flatMap(toArray)
        };
        observableProto.bufferWithTimeOrCount = observableProto.bufferTimeOrCount = function (timeSpan, count, scheduler) {
          return this.windowWithTimeOrCount(timeSpan, count, scheduler).flatMap(toArray)
        };
        var TimeIntervalObservable = function (__super__) {
          inherits(TimeIntervalObservable, __super__);
          function TimeIntervalObservable(source, s) {
            this.source = source;
            this._s = s;
            __super__.call(this)
          }
          return TimeIntervalObservable
        }(ObservableBase);
        var TimeIntervalObserver = function (__super__) {
          inherits(TimeIntervalObserver, __super__);
          function TimeIntervalObserver(o, s) {
            this._o = o;
            this._s = s;
            this._l = s.now();
            __super__.call(this)
          }
          return TimeIntervalObserver
        }(AbstractObserver);
        observableProto.timeInterval = function (scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return new TimeIntervalObservable(this, scheduler)
        };
        var TimestampObservable = function (__super__) {
          inherits(TimestampObservable, __super__);
          function TimestampObservable(source, s) {
            this.source = source;
            this._s = s;
            __super__.call(this)
          }
          return TimestampObservable
        }(ObservableBase);
        var TimestampObserver = function (__super__) {
          inherits(TimestampObserver, __super__);
          function TimestampObserver(o, s) {
            this._o = o;
            this._s = s;
            __super__.call(this)
          }
          return TimestampObserver
        }(AbstractObserver);
        observableProto.timestamp = function (scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return new TimestampObservable(this, scheduler)
        };
        var SampleObservable = function (__super__) {
          inherits(SampleObservable, __super__);
          function SampleObservable(source, sampler) {
            this.source = source;
            this._sampler = sampler;
            __super__.call(this)
          }
          return SampleObservable
        }(ObservableBase);
        var SamplerObserver = function (__super__) {
          inherits(SamplerObserver, __super__);
          function SamplerObserver(s) {
            this._s = s;
            __super__.call(this)
          }
          SamplerObserver.prototype.completed = function () {
            this._handleMessage()
          };
          return SamplerObserver
        }(AbstractObserver);
        var SampleSourceObserver = function (__super__) {
          inherits(SampleSourceObserver, __super__);
          function SampleSourceObserver(s) {
            this._s = s;
            __super__.call(this)
          }
          return SampleSourceObserver
        }(AbstractObserver);
        observableProto.sample = function (intervalOrSampler, scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return typeof intervalOrSampler === 'number' ? new SampleObservable(this, observableinterval(intervalOrSampler, scheduler)) : new SampleObservable(this, intervalOrSampler)
        };
        var TimeoutError = Rx.TimeoutError = function (message) {
          this.message = message || 'Timeout has occurred';
          this.name = 'TimeoutError';
          Error.call(this)
        };
        TimeoutError.prototype = Object.create(Error.prototype);
        function timeout(source, dueTime, other, scheduler) {
          if (isScheduler(other)) {
            scheduler = other;
            other = observableThrow(new TimeoutError())
          }
          if (other instanceof Error) {
            other = observableThrow(other)
          }
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          Observable.isObservable(other) || (other = observableThrow(new TimeoutError()));
          return new AnonymousObservable(function (o) {
            var id = 0, original = new SingleAssignmentDisposable(), subscription = new SerialDisposable(), switched = false, timer = new SerialDisposable();
            subscription.setDisposable(original);
            function createTimer() {
              var myId = id;
              timer.setDisposable(scheduler.scheduleFuture(null, dueTime, function () {
                switched = id === myId;
                if (switched) {
                  isPromise(other) && (other = observableFromPromise(other));
                  subscription.setDisposable(other.subscribe(o))
                }
              }))
            }
            createTimer();
            original.setDisposable(source.subscribe(function (x) {
              if (!switched) {
                id++;
                o.onNext(x);
                createTimer()
              }
            }, function (e) {
              if (!switched) {
                id++;
                o.onError(e)
              }
            }, function () {
              if (!switched) {
                id++;
                o.onCompleted()
              }
            }));
            return new BinaryDisposable(subscription, timer)
          }, source)
        }
        observableProto.timeout = function () {
          var firstArg = arguments[0];
          if (firstArg instanceof Date || typeof firstArg === 'number') {
            return timeout(this, firstArg, arguments[1], arguments[2])
          } else if (Observable.isObservable(firstArg) || isFunction(firstArg)) {
            return timeoutWithSelector(this, firstArg, arguments[1], arguments[2])
          } else {
            throw new Error('Invalid arguments')
          }
        };
        var GenerateAbsoluteObservable = function (__super__) {
          inherits(GenerateAbsoluteObservable, __super__);
          function GenerateAbsoluteObservable(state, cndFn, itrFn, resFn, timeFn, s) {
            this._state = state;
            this._cndFn = cndFn;
            this._itrFn = itrFn;
            this._resFn = resFn;
            this._timeFn = timeFn;
            this._s = s;
            __super__.call(this)
          }
          return GenerateAbsoluteObservable
        }(ObservableBase);
        Observable.generateWithAbsoluteTime = function (initialState, condition, iterate, resultSelector, timeSelector, scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return new GenerateAbsoluteObservable(initialState, condition, iterate, resultSelector, timeSelector, scheduler)
        };
        var GenerateRelativeObservable = function (__super__) {
          inherits(GenerateRelativeObservable, __super__);
          function GenerateRelativeObservable(state, cndFn, itrFn, resFn, timeFn, s) {
            this._state = state;
            this._cndFn = cndFn;
            this._itrFn = itrFn;
            this._resFn = resFn;
            this._timeFn = timeFn;
            this._s = s;
            __super__.call(this)
          }
          return GenerateRelativeObservable
        }(ObservableBase);
        Observable.generateWithRelativeTime = function (initialState, condition, iterate, resultSelector, timeSelector, scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return new GenerateRelativeObservable(initialState, condition, iterate, resultSelector, timeSelector, scheduler)
        };
        var DelaySubscription = function (__super__) {
          inherits(DelaySubscription, __super__);
          function DelaySubscription(source, dt, s) {
            this.source = source;
            this._dt = dt;
            this._s = s;
            __super__.call(this)
          }
          return DelaySubscription
        }(ObservableBase);
        observableProto.delaySubscription = function (dueTime, scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return new DelaySubscription(this, dueTime, scheduler)
        };
        var SkipLastWithTimeObservable = function (__super__) {
          inherits(SkipLastWithTimeObservable, __super__);
          function SkipLastWithTimeObservable(source, d, s) {
            this.source = source;
            this._d = d;
            this._s = s;
            __super__.call(this)
          }
          return SkipLastWithTimeObservable
        }(ObservableBase);
        var SkipLastWithTimeObserver = function (__super__) {
          inherits(SkipLastWithTimeObserver, __super__);
          function SkipLastWithTimeObserver(o, p) {
            this._o = o;
            this._s = p._s;
            this._d = p._d;
            this._q = [];
            __super__.call(this)
          }
          return SkipLastWithTimeObserver
        }(AbstractObserver);
        observableProto.skipLastWithTime = function (duration, scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return new SkipLastWithTimeObservable(this, duration, scheduler)
        };
        var TakeLastWithTimeObservable = function (__super__) {
          inherits(TakeLastWithTimeObservable, __super__);
          function TakeLastWithTimeObservable(source, d, s) {
            this.source = source;
            this._d = d;
            this._s = s;
            __super__.call(this)
          }
          return TakeLastWithTimeObservable
        }(ObservableBase);
        var TakeLastWithTimeObserver = function (__super__) {
          inherits(TakeLastWithTimeObserver, __super__);
          function TakeLastWithTimeObserver(o, d, s) {
            this._o = o;
            this._d = d;
            this._s = s;
            this._q = [];
            __super__.call(this)
          }
          return TakeLastWithTimeObserver
        }(AbstractObserver);
        observableProto.takeLastWithTime = function (duration, scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return new TakeLastWithTimeObservable(this, duration, scheduler)
        };
        observableProto.takeLastBufferWithTime = function (duration, scheduler) {
          var source = this;
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return new AnonymousObservable(source)
        };
        var TakeWithTimeObservable = function (__super__) {
          inherits(TakeWithTimeObservable, __super__);
          function TakeWithTimeObservable(source, d, s) {
            this.source = source;
            this._d = d;
            this._s = s;
            __super__.call(this)
          }
          return TakeWithTimeObservable
        }(ObservableBase);
        observableProto.takeWithTime = function (duration, scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return new TakeWithTimeObservable(this, duration, scheduler)
        };
        var SkipWithTimeObservable = function (__super__) {
          inherits(SkipWithTimeObservable, __super__);
          function SkipWithTimeObservable(source, d, s) {
            this.source = source;
            this._d = d;
            this._s = s;
            this._open = false;
            __super__.call(this)
          }
          return SkipWithTimeObservable
        }(ObservableBase);
        var SkipWithTimeObserver = function (__super__) {
          inherits(SkipWithTimeObserver, __super__);
          function SkipWithTimeObserver(o, p) {
            this._o = o;
            this._p = p;
            __super__.call(this)
          }
          return SkipWithTimeObserver
        }(AbstractObserver);
        observableProto.skipWithTime = function (duration, scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return new SkipWithTimeObservable(this, duration, scheduler)
        };
        var SkipUntilWithTimeObservable = function (__super__) {
          inherits(SkipUntilWithTimeObservable, __super__);
          function SkipUntilWithTimeObservable(source, startTime, scheduler) {
            this.source = source;
            this._st = startTime;
            this._s = scheduler;
            __super__.call(this)
          }
          return SkipUntilWithTimeObservable
        }(ObservableBase);
        var SkipUntilWithTimeObserver = function (__super__) {
          inherits(SkipUntilWithTimeObserver, __super__);
          function SkipUntilWithTimeObserver(o, p) {
            this._o = o;
            this._p = p;
            __super__.call(this)
          }
          return SkipUntilWithTimeObserver
        }(AbstractObserver);
        observableProto.skipUntilWithTime = function (startTime, scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          return new SkipUntilWithTimeObservable(this, startTime, scheduler)
        };
        observableProto.takeUntilWithTime = function (endTime, scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          var source = this;
          return new AnonymousObservable(source)
        };
        observableProto.throttle = function (windowDuration, scheduler) {
          isScheduler(scheduler) || (scheduler = defaultScheduler);
          var duration = +windowDuration || 0;
          if (duration <= 0) {
            throw new RangeError('windowDuration cannot be less or equal zero.')
          }
          var source = this;
          return new AnonymousObservable(source)
        };
        var TransduceObserver = function (__super__) {
          inherits(TransduceObserver, __super__);
          function TransduceObserver(o, xform) {
            this._o = o;
            this._xform = xform;
            __super__.call(this)
          }
          return TransduceObserver
        }(AbstractObserver);
        function transformForObserver(o) {
          return {
            '@@transducer/init': function () {
              return o
            },
            '@@transducer/step': function (obs, input) {
              return obs.onNext(input)
            },
            '@@transducer/result': function (obs) {
              return obs.onCompleted()
            }
          }
        }
        observableProto.transduce = function (transducer) {
          var source = this;
          return new AnonymousObservable(source)
        };
        var SwitchFirstObservable = function (__super__) {
          inherits(SwitchFirstObservable, __super__);
          function SwitchFirstObservable(source) {
            this.source = source;
            __super__.call(this)
          }
          return SwitchFirstObservable
        }(ObservableBase);
        var SwitchFirstObserver = function (__super__) {
          inherits(SwitchFirstObserver, __super__);
          function SwitchFirstObserver(state) {
            this._s = state;
            __super__.call(this)
          }
          inherits(InnerObserver, __super__);
          function InnerObserver(state, inner) {
            this._s = state;
            this._i = inner;
            __super__.call(this)
          }
          InnerObserver.prototype.next = function (x) {
            this._s.o.onNext(x)
          };
          InnerObserver.prototype.error = function (e) {
            this._s.o.onError(e)
          };
          InnerObserver.prototype.completed = function () {
            this._s.g.remove(this._i);
            this._s.hasCurrent = false;
            this._s.isStopped && this._s.g.length === 1 && this._s.o.onCompleted()
          };
          return SwitchFirstObserver
        }(AbstractObserver);
        observableProto.switchFirst = function () {
          return new SwitchFirstObservable(this)
        };
        observableProto.flatMapFirst = observableProto.exhaustMap = function (selector, resultSelector, thisArg) {
          return new FlatMapObservable(this, selector, resultSelector, thisArg).switchFirst()
        };
        observableProto.flatMapWithMaxConcurrent = observableProto.flatMapMaxConcurrent = function (limit, selector, resultSelector, thisArg) {
          return new FlatMapObservable(this, selector, resultSelector, thisArg).merge(limit)
        };
        var VirtualTimeScheduler = Rx.VirtualTimeScheduler = function (__super__) {
          inherits(VirtualTimeScheduler, __super__);
          function VirtualTimeScheduler(initialClock, comparer) {
            this.clock = initialClock;
            this.comparer = comparer;
            this.isEnabled = false;
            this.queue = new PriorityQueue(1024);
            __super__.call(this)
          }
          var VirtualTimeSchedulerPrototype = VirtualTimeScheduler.prototype;
          VirtualTimeSchedulerPrototype.now = function () {
            return this.toAbsoluteTime(this.clock)
          };
          VirtualTimeSchedulerPrototype.schedule = function (state, action) {
            return this.scheduleAbsolute(state, this.clock, action)
          };
          VirtualTimeSchedulerPrototype.scheduleFuture = function (state, dueTime, action) {
            var dt = dueTime instanceof Date ? this.toRelativeTime(dueTime - this.now()) : this.toRelativeTime(dueTime);
            return this.scheduleRelative(state, dt, action)
          };
          VirtualTimeSchedulerPrototype.add = notImplemented;
          VirtualTimeSchedulerPrototype.toAbsoluteTime = notImplemented;
          VirtualTimeSchedulerPrototype.toRelativeTime = notImplemented;
          VirtualTimeSchedulerPrototype.schedulePeriodic = function (state, period, action) {
            var s = new SchedulePeriodicRecursive(this, state, period, action);
            return s.start()
          };
          VirtualTimeSchedulerPrototype.scheduleRelative = function (state, dueTime, action) {
            var runAt = this.add(this.clock, dueTime);
            return this.scheduleAbsolute(state, runAt, action)
          };
          VirtualTimeSchedulerPrototype.start = function () {
            if (!this.isEnabled) {
              this.isEnabled = true;
              do {
                var next = this.getNext();
                if (next !== null) {
                  this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);
                  next.invoke()
                } else {
                  this.isEnabled = false
                }
              } while (this.isEnabled)
            }
          };
          VirtualTimeSchedulerPrototype.stop = function () {
            this.isEnabled = false
          };
          VirtualTimeSchedulerPrototype.advanceTo = function (time) {
            var dueToClock = this.comparer(this.clock, time);
            if (this.comparer(this.clock, time) > 0) {
              throw new ArgumentOutOfRangeError()
            }
            if (dueToClock === 0) {
              return
            }
            if (!this.isEnabled) {
              this.isEnabled = true;
              do {
                var next = this.getNext();
                if (next !== null && this.comparer(next.dueTime, time) <= 0) {
                  this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);
                  next.invoke()
                } else {
                  this.isEnabled = false
                }
              } while (this.isEnabled);
              this.clock = time
            }
          };
          VirtualTimeSchedulerPrototype.advanceBy = function (time) {
            var dt = this.add(this.clock, time), dueToClock = this.comparer(this.clock, dt);
            if (dueToClock > 0) {
              throw new ArgumentOutOfRangeError()
            }
            if (dueToClock === 0) {
              return
            }
            this.advanceTo(dt)
          };
          VirtualTimeSchedulerPrototype.sleep = function (time) {
            var dt = this.add(this.clock, time);
            if (this.comparer(this.clock, dt) >= 0) {
              throw new ArgumentOutOfRangeError()
            }
            this.clock = dt
          };
          VirtualTimeSchedulerPrototype.getNext = function () {
            while (this.queue.length > 0) {
              var next = this.queue.peek();
              if (next.isCancelled()) {
                this.queue.dequeue()
              } else {
                return next
              }
            }
            return null
          };
          VirtualTimeSchedulerPrototype.scheduleAbsolute = function (state, dueTime, action) {
            var self = this;
            var si = new ScheduledItem(this, state, run, dueTime, this.comparer);
            this.queue.enqueue(si);
            return si.disposable
          };
          return VirtualTimeScheduler
        }(Scheduler);
        Rx.HistoricalScheduler = function (__super__) {
          inherits(HistoricalScheduler, __super__);
          function HistoricalScheduler(initialClock, comparer) {
            var clock = initialClock == null ? 0 : initialClock;
            var cmp = comparer || defaultSubComparer;
            __super__.call(this, clock, cmp)
          }
          var HistoricalSchedulerProto = HistoricalScheduler.prototype;
          HistoricalSchedulerProto.add = function (absolute, relative) {
            return absolute + relative
          };
          HistoricalSchedulerProto.toAbsoluteTime = function (absolute) {
            return new Date(absolute).getTime()
          };
          HistoricalSchedulerProto.toRelativeTime = function (timeSpan) {
            return timeSpan
          };
          return HistoricalScheduler
        }(Rx.VirtualTimeScheduler);
        function OnNextPredicate(predicate) {
          this.predicate = predicate
        }
        function OnErrorPredicate(predicate) {
          this.predicate = predicate
        }
        var ReactiveTest = Rx.ReactiveTest = {
          created: 100,
          subscribed: 200,
          disposed: 1000,
          onNext: function (ticks, value) {
            return typeof value === 'function' ? new Recorded(ticks, new OnNextPredicate(value)) : new Recorded(ticks, Notification.createOnNext(value))
          },
          onError: function (ticks, error) {
            return typeof error === 'function' ? new Recorded(ticks, new OnErrorPredicate(error)) : new Recorded(ticks, Notification.createOnError(error))
          },
          onCompleted: function (ticks) {
            return new Recorded(ticks, Notification.createOnCompleted())
          },
          subscribe: function (start, end) {
            return new Subscription(start, end)
          }
        };
        var Recorded = Rx.Recorded = function (time, value, comparer) {
          this.time = time;
          this.value = value;
          this.comparer = comparer || defaultComparer
        };
        Recorded.prototype.equals = function (other) {
          return this.time === other.time && this.comparer(this.value, other.value)
        };
        Recorded.prototype.toString = function () {
          return this.value.toString() + '@' + this.time
        };
        var Subscription = Rx.Subscription = function (start, end) {
          this.subscribe = start;
          this.unsubscribe = end || Number.MAX_VALUE
        };
        Subscription.prototype.equals = function (other) {
          return this.subscribe === other.subscribe && this.unsubscribe === other.unsubscribe
        };
        Subscription.prototype.toString = function () {
          return '(' + this.subscribe + ', ' + (this.unsubscribe === Number.MAX_VALUE ? 'Infinite' : this.unsubscribe) + ')'
        };
        var MockDisposable = Rx.MockDisposable = function (scheduler) {
          this.scheduler = scheduler;
          this.disposes = [];
          this.disposes.push(this.scheduler.clock)
        };
        MockDisposable.prototype.dispose = function () {
          this.disposes.push(this.scheduler.clock)
        };
        var MockObserver = function (__super__) {
          inherits(MockObserver, __super__);
          function MockObserver(scheduler) {
            __super__.call(this);
            this.scheduler = scheduler;
            this.messages = []
          }
          var MockObserverPrototype = MockObserver.prototype;
          MockObserverPrototype.onNext = function (value) {
            this.messages.push(new Recorded(this.scheduler.clock, Notification.createOnNext(value)))
          };
          MockObserverPrototype.onError = function (e) {
            this.messages.push(new Recorded(this.scheduler.clock, Notification.createOnError(e)))
          };
          MockObserverPrototype.onCompleted = function () {
            this.messages.push(new Recorded(this.scheduler.clock, Notification.createOnCompleted()))
          };
          return MockObserver
        }(Observer);
        function MockPromise(scheduler, messages) {
          var self = this;
          this.scheduler = scheduler;
          this.messages = messages;
          this.subscriptions = [];
          this.observers = [];
          for (var i = 0, len = this.messages.length; i < len; i++) {
            var message = this.messages[i], notification = message.value;
            (function (innerNotification) {
              scheduler.scheduleAbsolute(null, message.time)
            }(notification))
          }
        }
        var HotObservable = function (__super__) {
          inherits(HotObservable, __super__);
          function HotObservable(scheduler, messages) {
            __super__.call(this);
            var message, notification, observable = this;
            this.scheduler = scheduler;
            this.messages = messages;
            this.subscriptions = [];
            this.observers = [];
            for (var i = 0, len = this.messages.length; i < len; i++) {
              message = this.messages[i];
              notification = message.value;
              (function (innerNotification) {
                scheduler.scheduleAbsolute(null, message.time, function () {
                  var obs = observable.observers.slice(0);
                  for (var j = 0, jLen = obs.length; j < jLen; j++) {
                    innerNotification.accept(obs[j])
                  }
                  return disposableEmpty
                })
              }(notification))
            }
          }
          HotObservable.prototype._subscribe = function (o) {
            var observable = this;
            this.observers.push(o);
            this.subscriptions.push(new Subscription(this.scheduler.clock));
            var index = this.subscriptions.length - 1;
            return disposableCreate(function () {
              var idx = observable.observers.indexOf(o);
              observable.observers.splice(idx, 1);
              observable.subscriptions[index] = new Subscription(observable.subscriptions[index].subscribe, observable.scheduler.clock)
            })
          };
          return HotObservable
        }(Observable);
        var ColdObservable = function (__super__) {
          inherits(ColdObservable, __super__);
          function ColdObservable(scheduler, messages) {
            __super__.call(this);
            this.scheduler = scheduler;
            this.messages = messages;
            this.subscriptions = []
          }
          return ColdObservable
        }(Observable);
        Rx.TestScheduler = function (__super__) {
          inherits(TestScheduler, __super__);
          function TestScheduler() {
            __super__.call(this, 0, baseComparer)
          }
          TestScheduler.prototype.toRelativeTime = function (timeSpan) {
            return timeSpan
          };
          TestScheduler.prototype.createResolvedPromise = function (ticks, value) {
            return new MockPromise(this, [
              Rx.ReactiveTest.onNext(ticks, value),
              Rx.ReactiveTest.onCompleted(ticks)
            ])
          };
          return TestScheduler
        }(VirtualTimeScheduler);
        var AnonymousObservable = Rx.AnonymousObservable = function (__super__) {
          inherits(AnonymousObservable, __super__);
          function fixSubscriber(subscriber) {
            return subscriber && isFunction(subscriber.dispose) ? subscriber : isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty
          }
          function setDisposable(s, state) {
            var ado = state[0], self = state[1];
            var sub = tryCatch(self.__subscribe).call(self, ado);
            if (sub === errorObj && !ado.fail(errorObj.e)) {
              thrower(errorObj.e)
            }
            ado.setDisposable(fixSubscriber(sub))
          }
          function AnonymousObservable(subscribe, parent) {
            this.source = parent;
            this.__subscribe = subscribe;
            __super__.call(this)
          }
          AnonymousObservable.prototype._subscribe = function (o) {
            var ado = new AutoDetachObserver(o), state = [
                ado,
                this
              ];
            if (currentThreadScheduler.scheduleRequired()) {
              currentThreadScheduler.schedule(state, setDisposable)
            } else {
              setDisposable(null, state)
            }
            return ado
          };
          return AnonymousObservable
        }(Observable);
        var AutoDetachObserver = function (__super__) {
          inherits(AutoDetachObserver, __super__);
          function AutoDetachObserver(observer) {
            __super__.call(this);
            this.observer = observer;
            this.m = new SingleAssignmentDisposable()
          }
          var AutoDetachObserverPrototype = AutoDetachObserver.prototype;
          AutoDetachObserverPrototype.next = function (value) {
            var result = tryCatch(this.observer.onNext).call(this.observer, value);
            if (result === errorObj) {
              this.dispose();
              thrower(result.e)
            }
          };
          AutoDetachObserverPrototype.error = function (err) {
            var result = tryCatch(this.observer.onError).call(this.observer, err);
            this.dispose();
            result === errorObj && thrower(result.e)
          };
          AutoDetachObserverPrototype.completed = function () {
            var result = tryCatch(this.observer.onCompleted).call(this.observer);
            this.dispose();
            result === errorObj && thrower(result.e)
          };
          AutoDetachObserverPrototype.setDisposable = function (value) {
            this.m.setDisposable(value)
          };
          AutoDetachObserverPrototype.getDisposable = function () {
            return this.m.getDisposable()
          };
          AutoDetachObserverPrototype.dispose = function () {
            __super__.prototype.dispose.call(this);
            this.m.dispose()
          };
          return AutoDetachObserver
        }(AbstractObserver);
        var UnderlyingObservable = function (__super__) {
          inherits(UnderlyingObservable, __super__);
          function UnderlyingObservable(m, u) {
            this._m = m;
            this._u = u;
            __super__.call(this)
          }
          return UnderlyingObservable
        }(ObservableBase);
        var GroupedObservable = function (__super__) {
          inherits(GroupedObservable, __super__);
          function GroupedObservable(key, underlyingObservable, mergedDisposable) {
            __super__.call(this);
            this.key = key;
            this.underlyingObservable = !mergedDisposable ? underlyingObservable : new UnderlyingObservable(mergedDisposable, underlyingObservable)
          }
          return GroupedObservable
        }(Observable);
        var Subject = Rx.Subject = function (__super__) {
          inherits(Subject, __super__);
          function Subject() {
            __super__.call(this);
            this.isDisposed = false;
            this.isStopped = false;
            this.observers = [];
            this.hasError = false
          }
          addProperties(Subject.prototype, Observer.prototype, {
            _subscribe: function (o) {
              checkDisposed(this);
              if (!this.isStopped) {
                this.observers.push(o);
                return new InnerSubscription(this, o)
              }
              if (this.hasError) {
                o.onError(this.error);
                return disposableEmpty
              }
              o.onCompleted();
              return disposableEmpty
            },
            hasObservers: function () {
              checkDisposed(this);
              return this.observers.length > 0
            },
            onCompleted: function () {
              checkDisposed(this);
              if (!this.isStopped) {
                this.isStopped = true;
                for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                  os[i].onCompleted()
                }
                this.observers.length = 0
              }
            },
            onError: function (error) {
              checkDisposed(this);
              if (!this.isStopped) {
                this.isStopped = true;
                this.error = error;
                this.hasError = true;
                for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                  os[i].onError(error)
                }
                this.observers.length = 0
              }
            },
            onNext: function (value) {
              checkDisposed(this);
              if (!this.isStopped) {
                for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                  os[i].onNext(value)
                }
              }
            },
            dispose: function () {
              this.isDisposed = true;
              this.observers = null
            }
          });
          Subject.create = function (observer, observable) {
            return new AnonymousSubject(observer, observable)
          };
          return Subject
        }(Observable);
        var AsyncSubject = Rx.AsyncSubject = function (__super__) {
          inherits(AsyncSubject, __super__);
          function AsyncSubject() {
            __super__.call(this);
            this.isDisposed = false;
            this.isStopped = false;
            this.hasValue = false;
            this.observers = [];
            this.hasError = false
          }
          addProperties(AsyncSubject.prototype, Observer.prototype, {
            _subscribe: function (o) {
              checkDisposed(this);
              if (!this.isStopped) {
                this.observers.push(o);
                return new InnerSubscription(this, o)
              }
              if (this.hasError) {
                o.onError(this.error)
              } else if (this.hasValue) {
                o.onNext(this.value);
                o.onCompleted()
              } else {
                o.onCompleted()
              }
              return disposableEmpty
            },
            hasObservers: function () {
              checkDisposed(this);
              return this.observers.length > 0
            },
            onCompleted: function () {
              var i, len;
              checkDisposed(this);
              if (!this.isStopped) {
                this.isStopped = true;
                var os = cloneArray(this.observers), len = os.length;
                if (this.hasValue) {
                  for (i = 0; i < len; i++) {
                    var o = os[i];
                    o.onNext(this.value);
                    o.onCompleted()
                  }
                } else {
                  for (i = 0; i < len; i++) {
                    os[i].onCompleted()
                  }
                }
                this.observers.length = 0
              }
            },
            onError: function (error) {
              checkDisposed(this);
              if (!this.isStopped) {
                this.isStopped = true;
                this.hasError = true;
                this.error = error;
                for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                  os[i].onError(error)
                }
                this.observers.length = 0
              }
            },
            onNext: function (value) {
              checkDisposed(this);
              if (this.isStopped) {
                return
              }
              this.value = value;
              this.hasValue = true
            },
            dispose: function () {
              this.isDisposed = true;
              this.observers = null;
              this.error = null;
              this.value = null
            }
          });
          return AsyncSubject
        }(Observable);
        var BehaviorSubject = Rx.BehaviorSubject = function (__super__) {
          inherits(BehaviorSubject, __super__);
          function BehaviorSubject(value) {
            __super__.call(this);
            this.value = value;
            this.observers = [];
            this.isDisposed = false;
            this.isStopped = false;
            this.hasError = false
          }
          addProperties(BehaviorSubject.prototype, Observer.prototype, {
            _subscribe: function (o) {
              checkDisposed(this);
              if (!this.isStopped) {
                this.observers.push(o);
                o.onNext(this.value);
                return new InnerSubscription(this, o)
              }
              if (this.hasError) {
                o.onError(this.error)
              } else {
                o.onCompleted()
              }
              return disposableEmpty
            },
            getValue: function () {
              checkDisposed(this);
              if (this.hasError) {
                thrower(this.error)
              }
              return this.value
            },
            hasObservers: function () {
              checkDisposed(this);
              return this.observers.length > 0
            },
            onCompleted: function () {
              checkDisposed(this);
              if (this.isStopped) {
                return
              }
              this.isStopped = true;
              for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                os[i].onCompleted()
              }
              this.observers.length = 0
            },
            onError: function (error) {
              checkDisposed(this);
              if (this.isStopped) {
                return
              }
              this.isStopped = true;
              this.hasError = true;
              this.error = error;
              for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                os[i].onError(error)
              }
              this.observers.length = 0
            },
            onNext: function (value) {
              checkDisposed(this);
              if (this.isStopped) {
                return
              }
              this.value = value;
              for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                os[i].onNext(value)
              }
            },
            dispose: function () {
              this.isDisposed = true;
              this.observers = null;
              this.value = null;
              this.error = null
            }
          });
          return BehaviorSubject
        }(Observable);
        var ReplaySubject = Rx.ReplaySubject = function (__super__) {
          var maxSafeInteger = Math.pow(2, 53) - 1;
          function createRemovableDisposable(subject, observer) {
            return disposableCreate(function () {
              observer.dispose();
              !subject.isDisposed && subject.observers.splice(subject.observers.indexOf(observer), 1)
            })
          }
          inherits(ReplaySubject, __super__);
          function ReplaySubject(bufferSize, windowSize, scheduler) {
            this.bufferSize = bufferSize == null ? maxSafeInteger : bufferSize;
            this.windowSize = windowSize == null ? maxSafeInteger : windowSize;
            this.scheduler = scheduler || currentThreadScheduler;
            this.q = [];
            this.observers = [];
            this.isStopped = false;
            this.isDisposed = false;
            this.hasError = false;
            this.error = null;
            __super__.call(this)
          }
          addProperties(ReplaySubject.prototype, Observer.prototype, {
            _subscribe: function (o) {
              checkDisposed(this);
              var so = new ScheduledObserver(this.scheduler, o), subscription = createRemovableDisposable(this, so);
              this._trim(this.scheduler.now());
              this.observers.push(so);
              for (var i = 0, len = this.q.length; i < len; i++) {
                so.onNext(this.q[i].value)
              }
              if (this.hasError) {
                so.onError(this.error)
              } else if (this.isStopped) {
                so.onCompleted()
              }
              so.ensureActive();
              return subscription
            },
            hasObservers: function () {
              checkDisposed(this);
              return this.observers.length > 0
            },
            _trim: function (now) {
              while (this.q.length > this.bufferSize) {
                this.q.shift()
              }
              while (this.q.length > 0 && now - this.q[0].interval > this.windowSize) {
                this.q.shift()
              }
            },
            onNext: function (value) {
              checkDisposed(this);
              if (this.isStopped) {
                return
              }
              var now = this.scheduler.now();
              this.q.push({
                interval: now,
                value: value
              });
              this._trim(now);
              for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                var observer = os[i];
                observer.onNext(value);
                observer.ensureActive()
              }
            },
            onError: function (error) {
              checkDisposed(this);
              if (this.isStopped) {
                return
              }
              this.isStopped = true;
              this.error = error;
              this.hasError = true;
              var now = this.scheduler.now();
              this._trim(now);
              for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                var observer = os[i];
                observer.onError(error);
                observer.ensureActive()
              }
              this.observers.length = 0
            },
            onCompleted: function () {
              checkDisposed(this);
              if (this.isStopped) {
                return
              }
              this.isStopped = true;
              var now = this.scheduler.now();
              this._trim(now);
              for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
                var observer = os[i];
                observer.onCompleted();
                observer.ensureActive()
              }
              this.observers.length = 0
            },
            dispose: function () {
              this.isDisposed = true;
              this.observers = null
            }
          });
          return ReplaySubject
        }(Observable);
        var AnonymousSubject = Rx.AnonymousSubject = function (__super__) {
          inherits(AnonymousSubject, __super__);
          function AnonymousSubject(observer, observable) {
            this.observer = observer;
            this.observable = observable;
            __super__.call(this)
          }
          addProperties(AnonymousSubject.prototype, Observer.prototype, {
            _subscribe: function (o) {
              return this.observable.subscribe(o)
            },
            onCompleted: function () {
              this.observer.onCompleted()
            },
            onError: function (error) {
              this.observer.onError(error)
            },
            onNext: function (value) {
              this.observer.onNext(value)
            }
          });
          return AnonymousSubject
        }(Observable);
        Rx.Pauser = function (__super__) {
          inherits(Pauser, __super__);
          function Pauser() {
            __super__.call(this)
          }
          return Pauser
        }(Subject);
        if (true) {
          root.Rx = Rx;
          !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
            return Rx
          }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
        } else if (freeExports && freeModule) {
          if (moduleExports) {
            (freeModule.exports = Rx).Rx = Rx
          } else {
            freeExports.Rx = Rx
          }
        } else {
          root.Rx = Rx
        }
        var rEndingLine = captureLine()
      }.call(this))
    }.call(exports, __webpack_require__(3)(module), function () {
      return this
    }(), __webpack_require__(4)))
  },
  function (module, exports) {
    module.exports = function (module) {
      if (!module.webpackPolyfill) {
        module.deprecate = function () {
        };
        module.paths = [];
        module.children = [];
        module.webpackPolyfill = 1
      }
      return module
    }
  },
  function (module, exports) {
    var process = module.exports = {};
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;
    function drainQueue() {
      if (draining) {
        return
      }
      var timeout = setTimeout(cleanUpNextTick);
      draining = true;
      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
          if (currentQueue) {
            currentQueue[queueIndex].run()
          }
        }
        queueIndex = -1;
        len = queue.length
      }
      currentQueue = null;
      draining = false;
      clearTimeout(timeout)
    }
    process.nextTick = function (fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
          args[i - 1] = arguments[i]
        }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0)
      }
    };
    function Item(fun, array) {
      this.fun = fun;
      this.array = array
    }
    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = '';
    process.versions = {};
    function noop() {
    }
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.binding = function (name) {
      throw new Error('process.binding is not supported')
    };
    process.cwd = function () {
      return '/'
    };
    process.chdir = function (dir) {
      throw new Error('process.chdir is not supported')
    };
    process.umask = function () {
      return 0
    }
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key]
          }
        }
      }
      return target
    };
    var _require = __webpack_require__(6);
    var svg = _require.svg;
    var SupportedSvgTags = _require.SupportedSvgTags;
    var _require2 = __webpack_require__(26);
    var makeDOMDriver = _require2.makeDOMDriver;
    var _require3 = __webpack_require__(48);
    var makeHTMLDriver = _require3.makeHTMLDriver;
    var mockDOMSource = __webpack_require__(61);
    var h = __webpack_require__(8);
    var hh = __webpack_require__(62)(h);
    var CycleDOM = _extends({
      makeDOMDriver: makeDOMDriver,
      makeHTMLDriver: makeHTMLDriver,
      h: h
    }, hh, {
      hJSX: function hJSX(tag, attrs) {
        var isSvgTag = SupportedSvgTags.indexOf(tag) !== -1;
        var domHandler = isSvgTag ? svg : h;
        for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          children[_key - 2] = arguments[_key]
        }
        return domHandler(tag, attrs, children)
      },
      svg: svg,
      mockDOMSource: mockDOMSource
    });
    module.exports = CycleDOM
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var isArray = __webpack_require__(7);
    var h = __webpack_require__(8);
    var SVGAttributeNamespace = __webpack_require__(24);
    var attributeHook = __webpack_require__(25);
    var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
    var SupportedSvgTags = [
      'circle',
      'clipPath',
      'defs',
      'ellipse',
      'g',
      'image',
      'line',
      'linearGradient',
      'mask',
      'path',
      'pattern',
      'polygon',
      'polyline',
      'radialGradient',
      'rect',
      'stop',
      'svg',
      'text',
      'tspan'
    ];
    module.exports = {
      svg: svg,
      SupportedSvgTags: SupportedSvgTags
    };
    function svg(tagName, properties, children) {
      if (!children && isChildren(properties)) {
        children = properties;
        properties = {}
      }
      properties = properties || {};
      properties.namespace = SVG_NAMESPACE;
      var attributes = properties.attributes || (properties.attributes = {});
      for (var key in properties) {
        if (!properties.hasOwnProperty(key)) {
          continue
        }
        var namespace = SVGAttributeNamespace(key);
        if (namespace === undefined) {
          continue
        }
        var value = properties[key];
        if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
          continue
        }
        if (namespace !== null) {
          properties[key] = attributeHook(namespace, value);
          continue
        }
        attributes[key] = value;
        properties[key] = undefined
      }
      return h(tagName, properties, children)
    }
    function isObservable(x) {
      return x && typeof x.subscribe === 'function'
    }
  },
  function (module, exports) {
    var nativeIsArray = Array.isArray;
    var toString = Object.prototype.toString;
    module.exports = nativeIsArray || isArray
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var isArray = __webpack_require__(7);
    var VNode = __webpack_require__(9);
    var VText = __webpack_require__(15);
    var isVNode = __webpack_require__(11);
    var isVText = __webpack_require__(16);
    var isWidget = __webpack_require__(12);
    var isHook = __webpack_require__(14);
    var isVThunk = __webpack_require__(13);
    var parseTag = __webpack_require__(17);
    var softSetHook = __webpack_require__(19);
    var evHook = __webpack_require__(20);
    module.exports = h;
    function h(tagName, properties, children) {
      var childNodes = [];
      var tag, props, key, namespace;
      if (!children && isChildren(properties)) {
        children = properties;
        props = {}
      }
      props = props || properties || {};
      tag = parseTag(tagName, props);
      if (props.hasOwnProperty('key')) {
        key = props.key;
        props.key = undefined
      }
      if (props.hasOwnProperty('namespace')) {
        namespace = props.namespace;
        props.namespace = undefined
      }
      if (tag === 'INPUT' && !namespace && props.hasOwnProperty('value') && props.value !== undefined && !isHook(props.value)) {
        props.value = softSetHook(props.value)
      }
      transformProperties(props);
      if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props)
      }
      return new VNode(tag, props, childNodes, key, namespace)
    }
    function addChild(c, childNodes, tag, props) {
      if (typeof c === 'string') {
        childNodes.push(new VText(c))
      } else if (typeof c === 'number') {
        childNodes.push(new VText(String(c)))
      } else if (isChild(c)) {
        childNodes.push(c)
      } else if (isArray(c)) {
        for (var i = 0; i < c.length; i++) {
          addChild(c[i], childNodes, tag, props)
        }
      } else if (c === null || c === undefined) {
        return
      } else {
        throw UnexpectedVirtualElement({
          foreignObject: c,
          parentVnode: {
            tagName: tag,
            properties: props
          }
        })
      }
    }
    function transformProperties(props) {
      for (var propName in props) {
        if (props.hasOwnProperty(propName)) {
          var value = props[propName];
          if (isHook(value)) {
            continue
          }
          if (propName.substr(0, 3) === 'ev-') {
            props[propName] = evHook(value)
          }
        }
      }
    }
    function isObservable(x) {
      return x && typeof x.subscribe === 'function'
    }
    function isChild(x) {
      return isVNode(x) || isVText(x) || isObservable(x) || isWidget(x) || isVThunk(x)
    }
    function isChildren(x) {
      return typeof x === 'string' || isArray(x) || isChild(x)
    }
    function errorString(obj) {
      try {
        return JSON.stringify(obj, null, '    ')
      } catch (e) {
        return String(obj)
      }
    }
  },
  function (module, exports, __webpack_require__) {
    var version = __webpack_require__(10);
    var isVNode = __webpack_require__(11);
    var isWidget = __webpack_require__(12);
    var isThunk = __webpack_require__(13);
    var isVHook = __webpack_require__(14);
    module.exports = VirtualNode;
    var noProperties = {};
    var noChildren = [];
    function VirtualNode(tagName, properties, children, key, namespace) {
      this.tagName = tagName;
      this.properties = properties || noProperties;
      this.children = children || noChildren;
      this.key = key != null ? String(key) : undefined;
      this.namespace = typeof namespace === 'string' ? namespace : null;
      var count = children && children.length || 0;
      var descendants = 0;
      var hasWidgets = false;
      var hasThunks = false;
      var descendantHooks = false;
      var hooks;
      for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
          var property = properties[propName];
          if (isVHook(property) && property.unhook) {
            if (!hooks) {
              hooks = {}
            }
            hooks[propName] = property
          }
        }
      }
      for (var i = 0; i < count; i++) {
        var child = children[i];
        if (isVNode(child)) {
          descendants += child.count || 0;
          if (!hasWidgets && child.hasWidgets) {
            hasWidgets = true
          }
          if (!hasThunks && child.hasThunks) {
            hasThunks = true
          }
          if (!descendantHooks && (child.hooks || child.descendantHooks)) {
            descendantHooks = true
          }
        } else if (!hasWidgets && isWidget(child)) {
          if (typeof child.destroy === 'function') {
            hasWidgets = true
          }
        } else if (!hasThunks && isThunk(child)) {
          hasThunks = true
        }
      }
      this.count = count + descendants;
      this.hasWidgets = hasWidgets;
      this.hasThunks = hasThunks;
      this.hooks = hooks;
      this.descendantHooks = descendantHooks
    }
    VirtualNode.prototype.version = version;
    VirtualNode.prototype.type = 'VirtualNode'
  },
  function (module, exports) {
    module.exports = '2'
  },
  function (module, exports, __webpack_require__) {
    var version = __webpack_require__(10);
    module.exports = isVirtualNode;
    function isVirtualNode(x) {
      return x && x.type === 'VirtualNode' && x.version === version
    }
  },
  function (module, exports) {
    module.exports = isWidget;
    function isWidget(w) {
      return w && w.type === 'Widget'
    }
  },
  function (module, exports) {
    module.exports = isThunk;
    function isThunk(t) {
      return t && t.type === 'Thunk'
    }
  },
  function (module, exports) {
    module.exports = isHook;
    function isHook(hook) {
      return hook && (typeof hook.hook === 'function' && !hook.hasOwnProperty('hook') || typeof hook.unhook === 'function' && !hook.hasOwnProperty('unhook'))
    }
  },
  function (module, exports, __webpack_require__) {
    var version = __webpack_require__(10);
    module.exports = VirtualText;
    function VirtualText(text) {
      this.text = String(text)
    }
    VirtualText.prototype.version = version;
    VirtualText.prototype.type = 'VirtualText'
  },
  function (module, exports, __webpack_require__) {
    var version = __webpack_require__(10);
    module.exports = isVirtualText;
    function isVirtualText(x) {
      return x && x.type === 'VirtualText' && x.version === version
    }
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var split = __webpack_require__(18);
    var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
    var notClassId = /^\.|#/;
    module.exports = parseTag;
    function parseTag(tag, props) {
      if (!tag) {
        return 'DIV'
      }
      var noId = !props.hasOwnProperty('id');
      var tagParts = split(tag, classIdSplit);
      var tagName = null;
      if (notClassId.test(tagParts[1])) {
        tagName = 'DIV'
      }
      var classes, part, type, i;
      for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];
        if (!part) {
          continue
        }
        type = part.charAt(0);
        if (!tagName) {
          tagName = part
        } else if (type === '.') {
          classes = classes || [];
          classes.push(part.substring(1, part.length))
        } else if (type === '#' && noId) {
          props.id = part.substring(1, part.length)
        }
      }
      if (classes) {
        if (props.className) {
          classes.push(props.className)
        }
        props.className = classes.join(' ')
      }
      return props.namespace ? tagName : tagName.toUpperCase()
    }
  },
  function (module, exports) {
    module.exports = function split(undef) {
      var nativeSplit = String.prototype.split, compliantExecNpcg = /()??/.exec('')[1] === undef, self;
      self = function (str, separator, limit) {
        if (Object.prototype.toString.call(separator) !== '[object RegExp]') {
          return nativeSplit.call(str, separator, limit)
        }
        var output = [], flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.extended ? 'x' : '') + (separator.sticky ? 'y' : ''), lastLastIndex = 0, separator = new RegExp(separator.source, flags + 'g'), separator2, match, lastIndex, lastLength;
        str += '';
        if (!compliantExecNpcg) {
          separator2 = new RegExp('^' + separator.source + '$(?!\\s)', flags)
        }
        limit = limit === undef ? -1 >>> 0 : limit >>> 0;
        while (match = separator.exec(str)) {
          lastIndex = match.index + match[0].length;
          if (lastIndex > lastLastIndex) {
            output.push(str.slice(lastLastIndex, match.index));
            if (!compliantExecNpcg && match.length > 1) {
              match[0].replace(separator2, function () {
                for (var i = 1; i < arguments.length - 2; i++) {
                  if (arguments[i] === undef) {
                    match[i] = undef
                  }
                }
              })
            }
            if (match.length > 1 && match.index < str.length) {
              Array.prototype.push.apply(output, match.slice(1))
            }
            lastLength = match[0].length;
            lastLastIndex = lastIndex;
            if (output.length >= limit) {
              break
            }
          }
          if (separator.lastIndex === match.index) {
            separator.lastIndex++
          }
        }
        if (lastLastIndex === str.length) {
          if (lastLength || !separator.test('')) {
            output.push('')
          }
        } else {
          output.push(str.slice(lastLastIndex))
        }
        return output.length > limit ? output.slice(0, limit) : output
      };
      return self
    }()
  },
  function (module, exports) {
    'use strict';
    module.exports = SoftSetHook;
    function SoftSetHook(value) {
      if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value)
      }
      this.value = value
    }
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var EvStore = __webpack_require__(21);
    module.exports = EvHook;
    function EvHook(value) {
      if (!(this instanceof EvHook)) {
        return new EvHook(value)
      }
      this.value = value
    }
    EvHook.prototype.unhook = function (node, propertyName) {
      var es = EvStore(node);
      var propName = propertyName.substr(3);
      es[propName] = undefined
    }
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var OneVersionConstraint = __webpack_require__(22);
    var MY_VERSION = '7';
    OneVersionConstraint('ev-store', MY_VERSION);
    var hashKey = '__EV_STORE_KEY@' + MY_VERSION;
    module.exports = EvStore;
    function EvStore(elem) {
      var hash = elem[hashKey];
      if (!hash) {
        hash = elem[hashKey] = {}
      }
      return hash
    }
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var Individual = __webpack_require__(23);
    module.exports = OneVersion;
    function OneVersion(moduleName, version, defaultValue) {
      var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
      var enforceKey = key + '_ENFORCE_SINGLETON';
      var versionValue = Individual(enforceKey, version);
      if (versionValue !== version) {
        throw new Error('Can only have one copy of ' + moduleName + '.\n' + 'You already have version ' + versionValue + ' installed.\n' + 'This means you cannot install version ' + version)
      }
      return Individual(key, defaultValue)
    }
  },
  function (module, exports) {
    (function (global) {
      'use strict';
      var root = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {};
      module.exports = Individual;
      function Individual(key, value) {
        if (key in root) {
          return root[key]
        }
        root[key] = value;
        return value
      }
    }.call(exports, function () {
      return this
    }()))
  },
  function (module, exports) {
    'use strict';
    var DEFAULT_NAMESPACE = null;
    var EV_NAMESPACE = 'http://www.w3.org/2001/xml-events';
    var XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
    var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
    var SVG_PROPERTIES = {
      'about': DEFAULT_NAMESPACE,
      'accent-height': DEFAULT_NAMESPACE,
      'accumulate': DEFAULT_NAMESPACE,
      'additive': DEFAULT_NAMESPACE,
      'alignment-baseline': DEFAULT_NAMESPACE,
      'alphabetic': DEFAULT_NAMESPACE,
      'amplitude': DEFAULT_NAMESPACE,
      'arabic-form': DEFAULT_NAMESPACE,
      'ascent': DEFAULT_NAMESPACE,
      'attributeName': DEFAULT_NAMESPACE,
      'attributeType': DEFAULT_NAMESPACE,
      'azimuth': DEFAULT_NAMESPACE,
      'bandwidth': DEFAULT_NAMESPACE,
      'baseFrequency': DEFAULT_NAMESPACE,
      'baseProfile': DEFAULT_NAMESPACE,
      'baseline-shift': DEFAULT_NAMESPACE,
      'bbox': DEFAULT_NAMESPACE,
      'begin': DEFAULT_NAMESPACE,
      'bias': DEFAULT_NAMESPACE,
      'by': DEFAULT_NAMESPACE,
      'calcMode': DEFAULT_NAMESPACE,
      'cap-height': DEFAULT_NAMESPACE,
      'class': DEFAULT_NAMESPACE,
      'clip': DEFAULT_NAMESPACE,
      'clip-path': DEFAULT_NAMESPACE,
      'clip-rule': DEFAULT_NAMESPACE,
      'clipPathUnits': DEFAULT_NAMESPACE,
      'color': DEFAULT_NAMESPACE,
      'color-interpolation': DEFAULT_NAMESPACE,
      'color-interpolation-filters': DEFAULT_NAMESPACE,
      'color-profile': DEFAULT_NAMESPACE,
      'color-rendering': DEFAULT_NAMESPACE,
      'content': DEFAULT_NAMESPACE,
      'contentScriptType': DEFAULT_NAMESPACE,
      'contentStyleType': DEFAULT_NAMESPACE,
      'cursor': DEFAULT_NAMESPACE,
      'cx': DEFAULT_NAMESPACE,
      'cy': DEFAULT_NAMESPACE,
      'd': DEFAULT_NAMESPACE,
      'datatype': DEFAULT_NAMESPACE,
      'defaultAction': DEFAULT_NAMESPACE,
      'descent': DEFAULT_NAMESPACE,
      'diffuseConstant': DEFAULT_NAMESPACE,
      'direction': DEFAULT_NAMESPACE,
      'display': DEFAULT_NAMESPACE,
      'divisor': DEFAULT_NAMESPACE,
      'dominant-baseline': DEFAULT_NAMESPACE,
      'dur': DEFAULT_NAMESPACE,
      'dx': DEFAULT_NAMESPACE,
      'dy': DEFAULT_NAMESPACE,
      'edgeMode': DEFAULT_NAMESPACE,
      'editable': DEFAULT_NAMESPACE,
      'elevation': DEFAULT_NAMESPACE,
      'enable-background': DEFAULT_NAMESPACE,
      'end': DEFAULT_NAMESPACE,
      'ev:event': EV_NAMESPACE,
      'event': DEFAULT_NAMESPACE,
      'exponent': DEFAULT_NAMESPACE,
      'externalResourcesRequired': DEFAULT_NAMESPACE,
      'fill': DEFAULT_NAMESPACE,
      'fill-opacity': DEFAULT_NAMESPACE,
      'fill-rule': DEFAULT_NAMESPACE,
      'filter': DEFAULT_NAMESPACE,
      'filterRes': DEFAULT_NAMESPACE,
      'filterUnits': DEFAULT_NAMESPACE,
      'flood-color': DEFAULT_NAMESPACE,
      'flood-opacity': DEFAULT_NAMESPACE,
      'focusHighlight': DEFAULT_NAMESPACE,
      'focusable': DEFAULT_NAMESPACE,
      'font-family': DEFAULT_NAMESPACE,
      'font-size': DEFAULT_NAMESPACE,
      'font-size-adjust': DEFAULT_NAMESPACE,
      'font-stretch': DEFAULT_NAMESPACE,
      'font-style': DEFAULT_NAMESPACE,
      'font-variant': DEFAULT_NAMESPACE,
      'font-weight': DEFAULT_NAMESPACE,
      'format': DEFAULT_NAMESPACE,
      'from': DEFAULT_NAMESPACE,
      'fx': DEFAULT_NAMESPACE,
      'fy': DEFAULT_NAMESPACE,
      'g1': DEFAULT_NAMESPACE,
      'g2': DEFAULT_NAMESPACE,
      'glyph-name': DEFAULT_NAMESPACE,
      'glyph-orientation-horizontal': DEFAULT_NAMESPACE,
      'glyph-orientation-vertical': DEFAULT_NAMESPACE,
      'glyphRef': DEFAULT_NAMESPACE,
      'gradientTransform': DEFAULT_NAMESPACE,
      'gradientUnits': DEFAULT_NAMESPACE,
      'handler': DEFAULT_NAMESPACE,
      'hanging': DEFAULT_NAMESPACE,
      'height': DEFAULT_NAMESPACE,
      'horiz-adv-x': DEFAULT_NAMESPACE,
      'horiz-origin-x': DEFAULT_NAMESPACE,
      'horiz-origin-y': DEFAULT_NAMESPACE,
      'id': DEFAULT_NAMESPACE,
      'ideographic': DEFAULT_NAMESPACE,
      'image-rendering': DEFAULT_NAMESPACE,
      'in': DEFAULT_NAMESPACE,
      'in2': DEFAULT_NAMESPACE,
      'initialVisibility': DEFAULT_NAMESPACE,
      'intercept': DEFAULT_NAMESPACE,
      'k': DEFAULT_NAMESPACE,
      'k1': DEFAULT_NAMESPACE,
      'k2': DEFAULT_NAMESPACE,
      'k3': DEFAULT_NAMESPACE,
      'k4': DEFAULT_NAMESPACE,
      'kernelMatrix': DEFAULT_NAMESPACE,
      'kernelUnitLength': DEFAULT_NAMESPACE,
      'kerning': DEFAULT_NAMESPACE,
      'keyPoints': DEFAULT_NAMESPACE,
      'keySplines': DEFAULT_NAMESPACE,
      'keyTimes': DEFAULT_NAMESPACE,
      'lang': DEFAULT_NAMESPACE,
      'lengthAdjust': DEFAULT_NAMESPACE,
      'letter-spacing': DEFAULT_NAMESPACE,
      'lighting-color': DEFAULT_NAMESPACE,
      'limitingConeAngle': DEFAULT_NAMESPACE,
      'local': DEFAULT_NAMESPACE,
      'marker-end': DEFAULT_NAMESPACE,
      'marker-mid': DEFAULT_NAMESPACE,
      'marker-start': DEFAULT_NAMESPACE,
      'markerHeight': DEFAULT_NAMESPACE,
      'markerUnits': DEFAULT_NAMESPACE,
      'markerWidth': DEFAULT_NAMESPACE,
      'mask': DEFAULT_NAMESPACE,
      'maskContentUnits': DEFAULT_NAMESPACE,
      'maskUnits': DEFAULT_NAMESPACE,
      'mathematical': DEFAULT_NAMESPACE,
      'max': DEFAULT_NAMESPACE,
      'media': DEFAULT_NAMESPACE,
      'mediaCharacterEncoding': DEFAULT_NAMESPACE,
      'mediaContentEncodings': DEFAULT_NAMESPACE,
      'mediaSize': DEFAULT_NAMESPACE,
      'mediaTime': DEFAULT_NAMESPACE,
      'method': DEFAULT_NAMESPACE,
      'min': DEFAULT_NAMESPACE,
      'mode': DEFAULT_NAMESPACE,
      'name': DEFAULT_NAMESPACE,
      'nav-down': DEFAULT_NAMESPACE,
      'nav-down-left': DEFAULT_NAMESPACE,
      'nav-down-right': DEFAULT_NAMESPACE,
      'nav-left': DEFAULT_NAMESPACE,
      'nav-next': DEFAULT_NAMESPACE,
      'nav-prev': DEFAULT_NAMESPACE,
      'nav-right': DEFAULT_NAMESPACE,
      'nav-up': DEFAULT_NAMESPACE,
      'nav-up-left': DEFAULT_NAMESPACE,
      'nav-up-right': DEFAULT_NAMESPACE,
      'numOctaves': DEFAULT_NAMESPACE,
      'observer': DEFAULT_NAMESPACE,
      'offset': DEFAULT_NAMESPACE,
      'opacity': DEFAULT_NAMESPACE,
      'operator': DEFAULT_NAMESPACE,
      'order': DEFAULT_NAMESPACE,
      'orient': DEFAULT_NAMESPACE,
      'orientation': DEFAULT_NAMESPACE,
      'origin': DEFAULT_NAMESPACE,
      'overflow': DEFAULT_NAMESPACE,
      'overlay': DEFAULT_NAMESPACE,
      'overline-position': DEFAULT_NAMESPACE,
      'overline-thickness': DEFAULT_NAMESPACE,
      'panose-1': DEFAULT_NAMESPACE,
      'path': DEFAULT_NAMESPACE,
      'pathLength': DEFAULT_NAMESPACE,
      'patternContentUnits': DEFAULT_NAMESPACE,
      'patternTransform': DEFAULT_NAMESPACE,
      'patternUnits': DEFAULT_NAMESPACE,
      'phase': DEFAULT_NAMESPACE,
      'playbackOrder': DEFAULT_NAMESPACE,
      'pointer-events': DEFAULT_NAMESPACE,
      'points': DEFAULT_NAMESPACE,
      'pointsAtX': DEFAULT_NAMESPACE,
      'pointsAtY': DEFAULT_NAMESPACE,
      'pointsAtZ': DEFAULT_NAMESPACE,
      'preserveAlpha': DEFAULT_NAMESPACE,
      'preserveAspectRatio': DEFAULT_NAMESPACE,
      'primitiveUnits': DEFAULT_NAMESPACE,
      'propagate': DEFAULT_NAMESPACE,
      'property': DEFAULT_NAMESPACE,
      'r': DEFAULT_NAMESPACE,
      'radius': DEFAULT_NAMESPACE,
      'refX': DEFAULT_NAMESPACE,
      'refY': DEFAULT_NAMESPACE,
      'rel': DEFAULT_NAMESPACE,
      'rendering-intent': DEFAULT_NAMESPACE,
      'repeatCount': DEFAULT_NAMESPACE,
      'repeatDur': DEFAULT_NAMESPACE,
      'requiredExtensions': DEFAULT_NAMESPACE,
      'requiredFeatures': DEFAULT_NAMESPACE,
      'requiredFonts': DEFAULT_NAMESPACE,
      'requiredFormats': DEFAULT_NAMESPACE,
      'resource': DEFAULT_NAMESPACE,
      'restart': DEFAULT_NAMESPACE,
      'result': DEFAULT_NAMESPACE,
      'rev': DEFAULT_NAMESPACE,
      'role': DEFAULT_NAMESPACE,
      'rotate': DEFAULT_NAMESPACE,
      'rx': DEFAULT_NAMESPACE,
      'ry': DEFAULT_NAMESPACE,
      'scale': DEFAULT_NAMESPACE,
      'seed': DEFAULT_NAMESPACE,
      'shape-rendering': DEFAULT_NAMESPACE,
      'slope': DEFAULT_NAMESPACE,
      'snapshotTime': DEFAULT_NAMESPACE,
      'spacing': DEFAULT_NAMESPACE,
      'specularConstant': DEFAULT_NAMESPACE,
      'specularExponent': DEFAULT_NAMESPACE,
      'spreadMethod': DEFAULT_NAMESPACE,
      'startOffset': DEFAULT_NAMESPACE,
      'stdDeviation': DEFAULT_NAMESPACE,
      'stemh': DEFAULT_NAMESPACE,
      'stemv': DEFAULT_NAMESPACE,
      'stitchTiles': DEFAULT_NAMESPACE,
      'stop-color': DEFAULT_NAMESPACE,
      'stop-opacity': DEFAULT_NAMESPACE,
      'strikethrough-position': DEFAULT_NAMESPACE,
      'strikethrough-thickness': DEFAULT_NAMESPACE,
      'string': DEFAULT_NAMESPACE,
      'stroke': DEFAULT_NAMESPACE,
      'stroke-dasharray': DEFAULT_NAMESPACE,
      'stroke-dashoffset': DEFAULT_NAMESPACE,
      'stroke-linecap': DEFAULT_NAMESPACE,
      'stroke-linejoin': DEFAULT_NAMESPACE,
      'stroke-miterlimit': DEFAULT_NAMESPACE,
      'stroke-opacity': DEFAULT_NAMESPACE,
      'stroke-width': DEFAULT_NAMESPACE,
      'surfaceScale': DEFAULT_NAMESPACE,
      'syncBehavior': DEFAULT_NAMESPACE,
      'syncBehaviorDefault': DEFAULT_NAMESPACE,
      'syncMaster': DEFAULT_NAMESPACE,
      'syncTolerance': DEFAULT_NAMESPACE,
      'syncToleranceDefault': DEFAULT_NAMESPACE,
      'systemLanguage': DEFAULT_NAMESPACE,
      'tableValues': DEFAULT_NAMESPACE,
      'target': DEFAULT_NAMESPACE,
      'targetX': DEFAULT_NAMESPACE,
      'targetY': DEFAULT_NAMESPACE,
      'text-anchor': DEFAULT_NAMESPACE,
      'text-decoration': DEFAULT_NAMESPACE,
      'text-rendering': DEFAULT_NAMESPACE,
      'textLength': DEFAULT_NAMESPACE,
      'timelineBegin': DEFAULT_NAMESPACE,
      'title': DEFAULT_NAMESPACE,
      'to': DEFAULT_NAMESPACE,
      'transform': DEFAULT_NAMESPACE,
      'transformBehavior': DEFAULT_NAMESPACE,
      'type': DEFAULT_NAMESPACE,
      'typeof': DEFAULT_NAMESPACE,
      'u1': DEFAULT_NAMESPACE,
      'u2': DEFAULT_NAMESPACE,
      'underline-position': DEFAULT_NAMESPACE,
      'underline-thickness': DEFAULT_NAMESPACE,
      'unicode': DEFAULT_NAMESPACE,
      'unicode-bidi': DEFAULT_NAMESPACE,
      'unicode-range': DEFAULT_NAMESPACE,
      'units-per-em': DEFAULT_NAMESPACE,
      'v-alphabetic': DEFAULT_NAMESPACE,
      'v-hanging': DEFAULT_NAMESPACE,
      'v-ideographic': DEFAULT_NAMESPACE,
      'v-mathematical': DEFAULT_NAMESPACE,
      'values': DEFAULT_NAMESPACE,
      'version': DEFAULT_NAMESPACE,
      'vert-adv-y': DEFAULT_NAMESPACE,
      'vert-origin-x': DEFAULT_NAMESPACE,
      'vert-origin-y': DEFAULT_NAMESPACE,
      'viewBox': DEFAULT_NAMESPACE,
      'viewTarget': DEFAULT_NAMESPACE,
      'visibility': DEFAULT_NAMESPACE,
      'width': DEFAULT_NAMESPACE,
      'widths': DEFAULT_NAMESPACE,
      'word-spacing': DEFAULT_NAMESPACE,
      'writing-mode': DEFAULT_NAMESPACE,
      'x': DEFAULT_NAMESPACE,
      'x-height': DEFAULT_NAMESPACE,
      'x1': DEFAULT_NAMESPACE,
      'x2': DEFAULT_NAMESPACE,
      'xChannelSelector': DEFAULT_NAMESPACE,
      'xlink:actuate': XLINK_NAMESPACE,
      'xlink:arcrole': XLINK_NAMESPACE,
      'xlink:href': XLINK_NAMESPACE,
      'xlink:role': XLINK_NAMESPACE,
      'xlink:show': XLINK_NAMESPACE,
      'xlink:title': XLINK_NAMESPACE,
      'xlink:type': XLINK_NAMESPACE,
      'xml:base': XML_NAMESPACE,
      'xml:id': XML_NAMESPACE,
      'xml:lang': XML_NAMESPACE,
      'xml:space': XML_NAMESPACE,
      'y': DEFAULT_NAMESPACE,
      'y1': DEFAULT_NAMESPACE,
      'y2': DEFAULT_NAMESPACE,
      'yChannelSelector': DEFAULT_NAMESPACE,
      'z': DEFAULT_NAMESPACE,
      'zoomAndPan': DEFAULT_NAMESPACE
    };
    module.exports = SVGAttributeNamespace;
    function SVGAttributeNamespace(value) {
      if (SVG_PROPERTIES.hasOwnProperty(value)) {
        return SVG_PROPERTIES[value]
      }
    }
  },
  function (module, exports) {
    'use strict';
    module.exports = AttributeHook;
    function AttributeHook(namespace, value) {
      if (!(this instanceof AttributeHook)) {
        return new AttributeHook(namespace, value)
      }
      this.namespace = namespace;
      this.value = value
    }
    AttributeHook.prototype.unhook = function (node, prop, next) {
      if (next && next.type === 'AttributeHook' && next.namespace === this.namespace) {
        return
      }
      var colonPosition = prop.indexOf(':');
      var localName = colonPosition > -1 ? prop.substr(colonPosition + 1) : prop;
      node.removeAttributeNS(this.namespace, localName)
    }
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var _slicedToArray = function () {
      return function (arr, i) {
        if (Array.isArray(arr)) {
          return arr
        } else if (Symbol.iterator in Object(arr)) {
          return sliceIterator(arr, i)
        } else {
          throw new TypeError('Invalid attempt to destructure non-iterable instance')
        }
      }
    }();
    var Rx = __webpack_require__(2);
    var fromEvent = __webpack_require__(27);
    var VDOM = {
      h: __webpack_require__(8),
      diff: __webpack_require__(28),
      patch: __webpack_require__(34),
      parse: typeof window !== 'undefined' ? __webpack_require__(43) : function () {
      }
    };
    var _require = __webpack_require__(46);
    var transposeVTree = _require.transposeVTree;
    var matchesSelector = undefined;
    try {
      matchesSelector = __webpack_require__(47)
    } catch (err) {
      matchesSelector = function () {
      }
    }
    function isElement(obj) {
      return typeof HTMLElement === 'object' ? obj instanceof HTMLElement || obj instanceof DocumentFragment : obj && typeof obj === 'object' && obj !== null && (obj.nodeType === 1 || obj.nodeType === 11) && typeof obj.nodeName === 'string'
    }
    function wrapTopLevelVTree(vtree, rootElem) {
      var _vtree$properties$id = vtree.properties.id;
      var vtreeId = _vtree$properties$id === undefined ? '' : _vtree$properties$id;
      var _vtree$properties$className = vtree.properties.className;
      var vtreeClass = _vtree$properties$className === undefined ? '' : _vtree$properties$className;
      var sameId = vtreeId === rootElem.id;
      var sameClass = vtreeClass === rootElem.className;
      var sameTagName = vtree.tagName.toUpperCase() === rootElem.tagName;
      if (sameId && sameClass && sameTagName) {
        return vtree
      }
      var attrs = {};
      if (rootElem.id) {
        attrs.id = rootElem.id
      }
      if (rootElem.className) {
        attrs.className = rootElem.className
      }
      return VDOM.h(rootElem.tagName, attrs, [vtree])
    }
    function makeDiffAndPatchToElement$(rootElem) {
      return function diffAndPatchToElement$(_ref) {
        var _ref2 = _slicedToArray(_ref, 2);
        var oldVTree = _ref2[0];
        var newVTree = _ref2[1];
        if (typeof newVTree === 'undefined') {
          return Rx.Observable.empty()
        }
        var prevVTree = wrapTopLevelVTree(oldVTree, rootElem);
        var nextVTree = wrapTopLevelVTree(newVTree, rootElem);
        rootElem = VDOM.patch(rootElem, VDOM.diff(prevVTree, nextVTree));
        return Rx.Observable.just(rootElem)
      }
    }
    function renderRawRootElem$(vtree$, domContainer) {
      var diffAndPatchToElement$ = makeDiffAndPatchToElement$(domContainer);
      return vtree$.flatMapLatest(transposeVTree).startWith(VDOM.parse(domContainer)).pairwise().flatMap(diffAndPatchToElement$)
    }
    function isolateSource(source, scope) {
      return source.select('.cycle-scope-' + scope)
    }
    function isolateSink(sink, scope) {
      return sink.map()
    }
    function makeIsStrictlyInRootScope(namespace) {
      var classIsForeign = function classIsForeign(c) {
        var matched = c.match(/cycle-scope-(\S+)/);
        return matched && namespace.indexOf('.' + c) === -1
      };
      var classIsDomestic = function classIsDomestic(c) {
        var matched = c.match(/cycle-scope-(\S+)/);
        return matched && namespace.indexOf('.' + c) !== -1
      };
      return function isStrictlyInRootScope(leaf) {
        for (var el = leaf; el; el = el.parentElement) {
          var split = String.prototype.split;
          var classList = el.classList || split.call(el.className, ' ');
          if (Array.prototype.some.call(classList, classIsDomestic)) {
            return true
          }
          if (Array.prototype.some.call(classList, classIsForeign)) {
            return false
          }
        }
        return true
      }
    }
    var eventTypesThatDontBubble = [
      'load',
      'unload',
      'focus',
      'blur',
      'mouseenter',
      'mouseleave',
      'submit',
      'change',
      'reset',
      'timeupdate',
      'playing',
      'waiting',
      'seeking',
      'seeked',
      'ended',
      'loadedmetadata',
      'loadeddata',
      'canplay',
      'canplaythrough',
      'durationchange',
      'play',
      'pause',
      'ratechange',
      'volumechange',
      'suspend',
      'emptied',
      'stalled'
    ];
    function maybeMutateEventPropagationAttributes(event) {
      if (!event.hasOwnProperty('propagationHasBeenStopped')) {
        (function () {
          event.propagationHasBeenStopped = false;
          var oldStopPropagation = event.stopPropagation;
          event.stopPropagation = function stopPropagation() {
            oldStopPropagation.call(this);
            this.propagationHasBeenStopped = true
          }
        }())
      }
    }
    function mutateEventCurrentTarget(event, currentTargetElement) {
      try {
        Object.defineProperty(event, 'currentTarget', {
          value: currentTargetElement,
          configurable: true
        })
      } catch (err) {
        void err
      }
      event.ownerTarget = currentTargetElement
    }
    function makeSimulateBubbling(namespace, rootEl) {
      var isStrictlyInRootScope = makeIsStrictlyInRootScope(namespace);
      var descendantSel = namespace.join(' ');
      var topSel = namespace.join('');
      var roof = rootEl.parentElement;
      return function simulateBubbling(ev) {
        maybeMutateEventPropagationAttributes(ev);
        if (ev.propagationHasBeenStopped) {
          return false
        }
        for (var el = ev.target; el && el !== roof; el = el.parentElement) {
          if (!isStrictlyInRootScope(el)) {
            continue
          }
          if (matchesSelector(el, descendantSel) || matchesSelector(el, topSel)) {
            mutateEventCurrentTarget(ev, el);
            return true
          }
        }
        return false
      }
    }
    function makeEventsSelector(rootEl$, namespace) {
      return function events(eventName) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        if (typeof eventName !== 'string') {
          throw new Error('DOM driver\'s events() expects argument to be a ' + 'string representing the event type to listen for.')
        }
        var useCapture = false;
        if (eventTypesThatDontBubble.indexOf(eventName) !== -1) {
          useCapture = true
        }
        if (typeof options.useCapture === 'boolean') {
          useCapture = options.useCapture
        }
        return rootEl$.first().flatMapLatest(function (rootEl) {
          if (!namespace || namespace.length === 0) {
            return fromEvent(rootEl, eventName, useCapture)
          }
          var simulateBubbling = makeSimulateBubbling(namespace, rootEl);
          return fromEvent(rootEl, eventName, useCapture).filter(simulateBubbling)
        }).share()
      }
    }
    function makeElementSelector(rootEl$) {
      return function select(selector) {
        if (typeof selector !== 'string') {
          throw new Error('DOM driver\'s select() expects the argument to be a ' + 'string as a CSS selector')
        }
        var namespace = this.namespace;
        var trimmedSelector = selector.trim();
        var childNamespace = trimmedSelector === ':root' ? namespace : namespace.concat(trimmedSelector);
        var element$ = rootEl$.map();
        return {
          observable: element$,
          namespace: childNamespace,
          select: makeElementSelector(rootEl$),
          events: makeEventsSelector(rootEl$, childNamespace),
          isolateSource: isolateSource,
          isolateSink: isolateSink
        }
      }
    }
    function validateDOMSink(vtree$) {
      if (!vtree$ || typeof vtree$.subscribe !== 'function') {
        throw new Error('The DOM driver function expects as input an ' + 'Observable of virtual DOM elements')
      }
    }
    function defaultOnErrorFn(msg) {
      if (console && console.error) {
        console.error(msg)
      } else {
        console.log(msg)
      }
    }
    function makeDOMDriver(container, options) {
      var domContainer = typeof container === 'string' ? document.querySelector(container) : container;
      if (typeof container === 'string' && domContainer === null) {
        throw new Error('Cannot render into unknown element `' + container + '`')
      } else if (!isElement(domContainer)) {
        throw new Error('Given container is not a DOM element neither a selector ' + 'string.')
      }
      var _ref3 = options || {};
      var _ref3$onError = _ref3.onError;
      var onError = _ref3$onError === undefined ? defaultOnErrorFn : _ref3$onError;
      if (typeof onError !== 'function') {
        throw new Error('You provided an `onError` to makeDOMDriver but it was ' + 'not a function. It should be a callback function to handle errors.')
      }
      return function domDriver(vtree$) {
        validateDOMSink(vtree$);
        var rootElem$ = renderRawRootElem$(vtree$, domContainer).startWith(domContainer).doOnError(onError).replay(null, 1);
        var disposable = rootElem$.connect();
        return {
          observable: rootElem$,
          namespace: [],
          select: makeElementSelector(rootElem$),
          events: makeEventsSelector(rootElem$, []),
          dispose: function dispose() {
            return disposable.dispose()
          },
          isolateSource: isolateSource,
          isolateSink: isolateSink
        }
      }
    }
    module.exports = {
      isElement: isElement,
      wrapTopLevelVTree: wrapTopLevelVTree,
      makeDiffAndPatchToElement$: makeDiffAndPatchToElement$,
      renderRawRootElem$: renderRawRootElem$,
      validateDOMSink: validateDOMSink,
      makeDOMDriver: makeDOMDriver
    }
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var Rx = __webpack_require__(2);
    var disposableCreate = Rx.Disposable.create;
    var CompositeDisposable = Rx.CompositeDisposable;
    var AnonymousObservable = Rx.AnonymousObservable;
    function createListener(_ref) {
      var element = _ref.element;
      var eventName = _ref.eventName;
      var handler = _ref.handler;
      var useCapture = _ref.useCapture;
      if (element.addEventListener) {
        element.addEventListener(eventName, handler, useCapture);
        return disposableCreate(function removeEventListener() {
          element.removeEventListener(eventName, handler, useCapture)
        })
      }
      throw new Error('No listener found')
    }
    function createEventListener(_ref2) {
      var element = _ref2.element;
      var eventName = _ref2.eventName;
      var handler = _ref2.handler;
      var useCapture = _ref2.useCapture;
      var disposables = new CompositeDisposable();
      if (Array.isArray(element)) {
        for (var i = 0, len = element.length; i < len; i++) {
          disposables.add(createEventListener({
            element: element[i],
            eventName: eventName,
            handler: handler,
            useCapture: useCapture
          }))
        }
      } else if (element) {
        disposables.add(createListener({
          element: element,
          eventName: eventName,
          handler: handler,
          useCapture: useCapture
        }))
      }
      return disposables
    }
    function fromEvent(element, eventName) {
      var useCapture = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
      return new AnonymousObservable(function subscribe(observer) {
        return createEventListener({
          element: element,
          eventName: eventName,
          handler: function handler() {
            observer.onNext(arguments[0])
          },
          useCapture: useCapture
        })
      }).share()
    }
    module.exports = fromEvent
  },
  function (module, exports, __webpack_require__) {
    var diff = __webpack_require__(29);
    module.exports = diff
  },
  function (module, exports, __webpack_require__) {
    var isArray = __webpack_require__(7);
    var VPatch = __webpack_require__(30);
    var isVNode = __webpack_require__(11);
    var isVText = __webpack_require__(16);
    var isWidget = __webpack_require__(12);
    var isThunk = __webpack_require__(13);
    var handleThunk = __webpack_require__(31);
    var diffProps = __webpack_require__(32);
    module.exports = diff;
    function diff(a, b) {
      var patch = { a: a };
      walk(a, b, patch, 0);
      return patch
    }
    function walk(a, b, patch, index) {
      if (a === b) {
        return
      }
      var apply = patch[index];
      var applyClear = false;
      if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
      } else if (b == null) {
        if (!isWidget(a)) {
          clearState(a, patch, index);
          apply = patch[index]
        }
        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
      } else if (isVNode(b)) {
        if (isVNode(a)) {
          if (a.tagName === b.tagName && a.namespace === b.namespace && a.key === b.key) {
            var propsPatch = diffProps(a.properties, b.properties);
            if (propsPatch) {
              apply = appendPatch(apply, new VPatch(VPatch.PROPS, a, propsPatch))
            }
            apply = diffChildren(a, b, patch, apply, index)
          } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b));
            applyClear = true
          }
        } else {
          apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b));
          applyClear = true
        }
      } else if (isVText(b)) {
        if (!isVText(a)) {
          apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b));
          applyClear = true
        } else if (a.text !== b.text) {
          apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
      } else if (isWidget(b)) {
        if (!isWidget(a)) {
          applyClear = true
        }
        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
      }
      if (apply) {
        patch[index] = apply
      }
      if (applyClear) {
        clearState(a, patch, index)
      }
    }
    function diffChildren(a, b, patch, apply, index) {
      var aChildren = a.children;
      var orderedSet = reorder(aChildren, b.children);
      var bChildren = orderedSet.children;
      var aLen = aChildren.length;
      var bLen = bChildren.length;
      var len = aLen > bLen ? aLen : bLen;
      for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i];
        var rightNode = bChildren[i];
        index += 1;
        if (!leftNode) {
          if (rightNode) {
            apply = appendPatch(apply, new VPatch(VPatch.INSERT, null, rightNode))
          }
        } else {
          walk(leftNode, rightNode, patch, index)
        }
        if (isVNode(leftNode) && leftNode.count) {
          index += leftNode.count
        }
      }
      if (orderedSet.moves) {
        apply = appendPatch(apply, new VPatch(VPatch.ORDER, a, orderedSet.moves))
      }
      return apply
    }
    function destroyWidgets(vNode, patch, index) {
      if (isWidget(vNode)) {
        if (typeof vNode.destroy === 'function') {
          patch[index] = appendPatch(patch[index], new VPatch(VPatch.REMOVE, vNode, null))
        }
      } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children;
        var len = children.length;
        for (var i = 0; i < len; i++) {
          var child = children[i];
          index += 1;
          destroyWidgets(child, patch, index);
          if (isVNode(child) && child.count) {
            index += child.count
          }
        }
      } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
      }
    }
    function hasPatches(patch) {
      for (var index in patch) {
        if (index !== 'a') {
          return true
        }
      }
      return false
    }
    function undefinedKeys(obj) {
      var result = {};
      for (var key in obj) {
        result[key] = undefined
      }
      return result
    }
    function reorder(aChildren, bChildren) {
      var bChildIndex = keyIndex(bChildren);
      var bKeys = bChildIndex.keys;
      var bFree = bChildIndex.free;
      if (bFree.length === bChildren.length) {
        return {
          children: bChildren,
          moves: null
        }
      }
      var aChildIndex = keyIndex(aChildren);
      var aKeys = aChildIndex.keys;
      var aFree = aChildIndex.free;
      if (aFree.length === aChildren.length) {
        return {
          children: bChildren,
          moves: null
        }
      }
      var newChildren = [];
      var freeIndex = 0;
      var freeCount = bFree.length;
      var deletedItems = 0;
      for (var i = 0; i < aChildren.length; i++) {
        var aItem = aChildren[i];
        var itemIndex;
        if (aItem.key) {
          if (bKeys.hasOwnProperty(aItem.key)) {
            itemIndex = bKeys[aItem.key];
            newChildren.push(bChildren[itemIndex])
          } else {
            itemIndex = i - deletedItems++;
            newChildren.push(null)
          }
        } else {
          if (freeIndex < freeCount) {
            itemIndex = bFree[freeIndex++];
            newChildren.push(bChildren[itemIndex])
          } else {
            itemIndex = i - deletedItems++;
            newChildren.push(null)
          }
        }
      }
      var lastFreeIndex = freeIndex >= bFree.length ? bChildren.length : bFree[freeIndex];
      for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j];
        if (newItem.key) {
          if (!aKeys.hasOwnProperty(newItem.key)) {
            newChildren.push(newItem)
          }
        } else if (j >= lastFreeIndex) {
          newChildren.push(newItem)
        }
      }
      var simulate = newChildren.slice();
      var simulateIndex = 0;
      var removes = [];
      var inserts = [];
      var simulateItem;
      for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k];
        simulateItem = simulate[simulateIndex];
        while (simulateItem === null && simulate.length) {
          removes.push(remove(simulate, simulateIndex, null));
          simulateItem = simulate[simulateIndex]
        }
        if (!simulateItem || simulateItem.key !== wantedItem.key) {
          if (wantedItem.key) {
            if (simulateItem && simulateItem.key) {
              if (bKeys[simulateItem.key] !== k + 1) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key));
                simulateItem = simulate[simulateIndex];
                if (!simulateItem || simulateItem.key !== wantedItem.key) {
                  inserts.push({
                    key: wantedItem.key,
                    to: k
                  })
                } else {
                  simulateIndex++
                }
              } else {
                inserts.push({
                  key: wantedItem.key,
                  to: k
                })
              }
            } else {
              inserts.push({
                key: wantedItem.key,
                to: k
              })
            }
            k++
          } else if (simulateItem && simulateItem.key) {
            removes.push(remove(simulate, simulateIndex, simulateItem.key))
          }
        } else {
          simulateIndex++;
          k++
        }
      }
      while (simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex];
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
      }
      if (removes.length === deletedItems && !inserts.length) {
        return {
          children: newChildren,
          moves: null
        }
      }
      return {
        children: newChildren,
        moves: {
          removes: removes,
          inserts: inserts
        }
      }
    }
    function keyIndex(children) {
      var keys = {};
      var free = [];
      var length = children.length;
      for (var i = 0; i < length; i++) {
        var child = children[i];
        if (child.key) {
          keys[child.key] = i
        } else {
          free.push(i)
        }
      }
      return {
        keys: keys,
        free: free
      }
    }
    function appendPatch(apply, patch) {
      if (apply) {
        if (isArray(apply)) {
          apply.push(patch)
        } else {
          apply = [
            apply,
            patch
          ]
        }
        return apply
      } else {
        return patch
      }
    }
  },
  function (module, exports, __webpack_require__) {
    var version = __webpack_require__(10);
    VirtualPatch.NONE = 0;
    VirtualPatch.VTEXT = 1;
    VirtualPatch.VNODE = 2;
    VirtualPatch.WIDGET = 3;
    VirtualPatch.PROPS = 4;
    VirtualPatch.ORDER = 5;
    VirtualPatch.INSERT = 6;
    VirtualPatch.REMOVE = 7;
    VirtualPatch.THUNK = 8;
    module.exports = VirtualPatch;
    function VirtualPatch(type, vNode, patch) {
      this.type = Number(type);
      this.vNode = vNode;
      this.patch = patch
    }
    VirtualPatch.prototype.version = version;
    VirtualPatch.prototype.type = 'VirtualPatch'
  },
  function (module, exports, __webpack_require__) {
    var isVNode = __webpack_require__(11);
    var isVText = __webpack_require__(16);
    var isWidget = __webpack_require__(12);
    var isThunk = __webpack_require__(13);
    module.exports = handleThunk;
    function handleThunk(a, b) {
      var renderedA = a;
      var renderedB = b;
      if (isThunk(b)) {
        renderedB = renderThunk(b, a)
      }
      if (isThunk(a)) {
        renderedA = renderThunk(a, null)
      }
      return {
        a: renderedA,
        b: renderedB
      }
    }
  },
  function (module, exports, __webpack_require__) {
    var isObject = __webpack_require__(33);
    var isHook = __webpack_require__(14);
    module.exports = diffProps;
    function diffProps(a, b) {
      var diff;
      for (var aKey in a) {
        if (!(aKey in b)) {
          diff = diff || {};
          diff[aKey] = undefined
        }
        var aValue = a[aKey];
        var bValue = b[aKey];
        if (aValue === bValue) {
          continue
        } else if (isObject(aValue) && isObject(bValue)) {
          if (getPrototype(bValue) !== getPrototype(aValue)) {
            diff = diff || {};
            diff[aKey] = bValue
          } else if (isHook(bValue)) {
            diff = diff || {};
            diff[aKey] = bValue
          } else {
            var objectDiff = diffProps(aValue, bValue);
            if (objectDiff) {
              diff = diff || {};
              diff[aKey] = objectDiff
            }
          }
        } else {
          diff = diff || {};
          diff[aKey] = bValue
        }
      }
      for (var bKey in b) {
        if (!(bKey in a)) {
          diff = diff || {};
          diff[bKey] = b[bKey]
        }
      }
      return diff
    }
  },
  function (module, exports) {
    'use strict';
    module.exports = function isObject(x) {
      return typeof x === 'object' && x !== null
    }
  },
  function (module, exports, __webpack_require__) {
    var patch = __webpack_require__(35);
    module.exports = patch
  },
  function (module, exports, __webpack_require__) {
    var document = __webpack_require__(36);
    var isArray = __webpack_require__(7);
    var render = __webpack_require__(38);
    var domIndex = __webpack_require__(40);
    var patchOp = __webpack_require__(41);
    module.exports = patch;
    function patch(rootNode, patches, renderOptions) {
      renderOptions = renderOptions || {};
      renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch ? renderOptions.patch : patchRecursive;
      renderOptions.render = renderOptions.render || render;
      return renderOptions.patch(rootNode, patches, renderOptions)
    }
    function patchRecursive(rootNode, patches, renderOptions) {
      var indices = patchIndices(patches);
      if (indices.length === 0) {
        return rootNode
      }
      var index = domIndex(rootNode, patches.a, indices);
      var ownerDocument = rootNode.ownerDocument;
      if (!renderOptions.document && ownerDocument !== document) {
        renderOptions.document = ownerDocument
      }
      for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i];
        rootNode = applyPatch(rootNode, index[nodeIndex], patches[nodeIndex], renderOptions)
      }
      return rootNode
    }
    function applyPatch(rootNode, domNode, patchList, renderOptions) {
      if (!domNode) {
        return rootNode
      }
      var newNode;
      if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
          newNode = patchOp(patchList[i], domNode, renderOptions);
          if (domNode === rootNode) {
            rootNode = newNode
          }
        }
      } else {
        newNode = patchOp(patchList, domNode, renderOptions);
        if (domNode === rootNode) {
          rootNode = newNode
        }
      }
      return rootNode
    }
    function patchIndices(patches) {
      var indices = [];
      for (var key in patches) {
        if (key !== 'a') {
          indices.push(Number(key))
        }
      }
      return indices
    }
  },
  function (module, exports, __webpack_require__) {
    (function (global) {
      var topLevel = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : {};
      var minDoc = __webpack_require__(37);
      if (typeof document !== 'undefined') {
        module.exports = document
      } else {
        var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];
        if (!doccy) {
          doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc
        }
        module.exports = doccy
      }
    }.call(exports, function () {
      return this
    }()))
  },
  function (module, exports) {
  },
  function (module, exports, __webpack_require__) {
    var document = __webpack_require__(36);
    var applyProperties = __webpack_require__(39);
    var isVNode = __webpack_require__(11);
    var isVText = __webpack_require__(16);
    var isWidget = __webpack_require__(12);
    var handleThunk = __webpack_require__(31);
    module.exports = createElement;
    function createElement(vnode, opts) {
      var doc = opts ? opts.document || document : document;
      var warn = opts ? opts.warn : null;
      vnode = handleThunk(vnode).a;
      if (isWidget(vnode)) {
        return vnode.init()
      } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
      } else if (!isVNode(vnode)) {
        if (warn) {
          warn('Item is not a valid virtual dom node', vnode)
        }
        return null
      }
      var node = vnode.namespace === null ? doc.createElement(vnode.tagName) : doc.createElementNS(vnode.namespace, vnode.tagName);
      var props = vnode.properties;
      applyProperties(node, props);
      var children = vnode.children;
      for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts);
        if (childNode) {
          node.appendChild(childNode)
        }
      }
      return node
    }
  },
  function (module, exports, __webpack_require__) {
    var isObject = __webpack_require__(33);
    var isHook = __webpack_require__(14);
    module.exports = applyProperties;
    function applyProperties(node, props, previous) {
      for (var propName in props) {
        var propValue = props[propName];
        if (propValue === undefined) {
          removeProperty(node, propName, propValue, previous)
        } else if (isHook(propValue)) {
          removeProperty(node, propName, propValue, previous);
          if (propValue.hook) {
            propValue.hook(node, propName, previous ? previous[propName] : undefined)
          }
        } else {
          if (isObject(propValue)) {
            patchObject(node, props, previous, propName, propValue)
          } else {
            node[propName] = propValue
          }
        }
      }
    }
    function patchObject(node, props, previous, propName, propValue) {
      var previousValue = previous ? previous[propName] : undefined;
      if (propName === 'attributes') {
        for (var attrName in propValue) {
          var attrValue = propValue[attrName];
          if (attrValue === undefined) {
            node.removeAttribute(attrName)
          } else {
            node.setAttribute(attrName, attrValue)
          }
        }
        return
      }
      if (previousValue && isObject(previousValue) && getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue;
        return
      }
      if (!isObject(node[propName])) {
        node[propName] = {}
      }
      var replacer = propName === 'style' ? '' : undefined;
      for (var k in propValue) {
        var value = propValue[k];
        node[propName][k] = value === undefined ? replacer : value
      }
    }
  },
  function (module, exports) {
    var noChild = {};
    module.exports = domIndex;
    function domIndex(rootNode, tree, indices, nodes) {
      if (!indices || indices.length === 0) {
        return {}
      } else {
        indices.sort(ascending);
        return recurse(rootNode, tree, indices, nodes, 0)
      }
    }
    function recurse(rootNode, tree, indices, nodes, rootIndex) {
      nodes = nodes || {};
      if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
          nodes[rootIndex] = rootNode
        }
        var vChildren = tree.children;
        if (vChildren) {
          var childNodes = rootNode.childNodes;
          for (var i = 0; i < tree.children.length; i++) {
            rootIndex += 1;
            var vChild = vChildren[i] || noChild;
            var nextIndex = rootIndex + (vChild.count || 0);
            if (indexInRange(indices, rootIndex, nextIndex)) {
              recurse(childNodes[i], vChild, indices, nodes, rootIndex)
            }
            rootIndex = nextIndex
          }
        }
      }
      return nodes
    }
    function indexInRange(indices, left, right) {
      if (indices.length === 0) {
        return false
      }
      var minIndex = 0;
      var maxIndex = indices.length - 1;
      var currentIndex;
      var currentItem;
      while (minIndex <= maxIndex) {
        currentIndex = (maxIndex + minIndex) / 2 >> 0;
        currentItem = indices[currentIndex];
        if (minIndex === maxIndex) {
          return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
          minIndex = currentIndex + 1
        } else if (currentItem > right) {
          maxIndex = currentIndex - 1
        } else {
          return true
        }
      }
      return false
    }
    function ascending(a, b) {
      return a > b ? 1 : -1
    }
  },
  function (module, exports, __webpack_require__) {
    var applyProperties = __webpack_require__(39);
    var isWidget = __webpack_require__(12);
    var VPatch = __webpack_require__(30);
    var updateWidget = __webpack_require__(42);
    module.exports = applyPatch;
    function applyPatch(vpatch, domNode, renderOptions) {
      var type = vpatch.type;
      var vNode = vpatch.vNode;
      var patch = vpatch.patch;
      switch (type) {
      case VPatch.REMOVE:
        return removeNode(domNode, vNode);
      case VPatch.INSERT:
        return insertNode(domNode, patch, renderOptions);
      case VPatch.VTEXT:
        return stringPatch(domNode, vNode, patch, renderOptions);
      case VPatch.WIDGET:
        return widgetPatch(domNode, vNode, patch, renderOptions);
      case VPatch.VNODE:
        return vNodePatch(domNode, vNode, patch, renderOptions);
      case VPatch.ORDER:
        reorderChildren(domNode, patch);
        return domNode;
      case VPatch.PROPS:
        applyProperties(domNode, patch, vNode.properties);
        return domNode;
      case VPatch.THUNK:
        return replaceRoot(domNode, renderOptions.patch(domNode, patch, renderOptions));
      default:
        return domNode
      }
    }
    function insertNode(parentNode, vNode, renderOptions) {
      var newNode = renderOptions.render(vNode, renderOptions);
      if (parentNode) {
        parentNode.appendChild(newNode)
      }
      return parentNode
    }
    function stringPatch(domNode, leftVNode, vText, renderOptions) {
      var newNode;
      if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text);
        newNode = domNode
      } else {
        var parentNode = domNode.parentNode;
        newNode = renderOptions.render(vText, renderOptions);
        if (parentNode && newNode !== domNode) {
          parentNode.replaceChild(newNode, domNode)
        }
      }
      return newNode
    }
    function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
      var parentNode = domNode.parentNode;
      var newNode = renderOptions.render(vNode, renderOptions);
      if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
      }
      return newNode
    }
    function reorderChildren(domNode, moves) {
      var childNodes = domNode.childNodes;
      var keyMap = {};
      var node;
      var remove;
      var insert;
      for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i];
        node = childNodes[remove.from];
        if (remove.key) {
          keyMap[remove.key] = node
        }
        domNode.removeChild(node)
      }
      var length = childNodes.length;
      for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j];
        node = keyMap[insert.key];
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
      }
    }
  },
  function (module, exports, __webpack_require__) {
    var isWidget = __webpack_require__(12);
    module.exports = updateWidget;
    function updateWidget(a, b) {
      if (isWidget(a) && isWidget(b)) {
        if ('name' in a && 'name' in b) {
          return a.id === b.id
        } else {
          return a.init === b.init
        }
      }
      return false
    }
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var VNode = __webpack_require__(9);
    var VText = __webpack_require__(15);
    var domParser = new DOMParser();
    var propertyMap = __webpack_require__(44);
    var namespaceMap = __webpack_require__(45);
    var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
    module.exports = parser;
    function parser(el, attr) {
      if (!el) {
        return createNode(document.createTextNode(''))
      }
      if (typeof el === 'string') {
        var doc = domParser.parseFromString(el, 'text/html');
        if (doc.body.firstChild) {
          el = doc.body.firstChild
        } else if (doc.head.firstChild && (doc.head.firstChild.tagName !== 'TITLE' || doc.title)) {
          el = doc.head.firstChild
        } else if (doc.firstChild && doc.firstChild.tagName !== 'HTML') {
          el = doc.firstChild
        } else {
          el = document.createTextNode('')
        }
      }
      if (typeof el !== 'object' || !el || !el.nodeType) {
        throw new Error('invalid dom node', el)
      }
      return createNode(el, attr)
    }
    function createNode(el, attr) {
      if (el.nodeType === 3) {
        return createVirtualTextNode(el)
      } else if (el.nodeType === 1 || el.nodeType === 9) {
        return createVirtualDomNode(el, attr)
      }
      return new VText('')
    }
    function createVirtualDomNode(el, attr) {
      var ns = el.namespaceURI !== HTML_NAMESPACE ? el.namespaceURI : null;
      var key = attr && el.getAttribute(attr) ? el.getAttribute(attr) : null;
      return new VNode(el.tagName, createProperties(el), createChildren(el, attr), key, ns)
    }
    function createChildren(el, attr) {
      var children = [];
      for (var i = 0; i < el.childNodes.length; i++) {
        children.push(createNode(el.childNodes[i], attr))
      }
      ;
      return children
    }
    function createProperties(el) {
      var properties = {};
      if (!el.hasAttributes()) {
        return properties
      }
      var ns;
      if (el.namespaceURI && el.namespaceURI !== HTML_NAMESPACE) {
        ns = el.namespaceURI
      }
      var attr;
      for (var i = 0; i < el.attributes.length; i++) {
        if (ns) {
          attr = createPropertyNS(el.attributes[i])
        } else {
          attr = createProperty(el.attributes[i])
        }
        if (attr.ns) {
          properties[attr.name] = {
            namespace: attr.ns,
            value: attr.value
          }
        } else if (attr.isAttr) {
          if (!properties.attributes) {
            properties.attributes = {}
          }
          properties.attributes[attr.name] = attr.value
        } else {
          properties[attr.name] = attr.value
        }
      }
      ;
      return properties
    }
    function createProperty(attr) {
      var name, value, isAttr;
      if (propertyMap[attr.name]) {
        name = propertyMap[attr.name]
      } else {
        name = attr.name
      }
      if (name === 'style') {
        var style = {};
        attr.value.split(';').forEach(function (s) {
          var pos = s.indexOf(':');
          if (pos < 0) {
            return
          }
          style[s.substr(0, pos).trim()] = s.substr(pos + 1).trim()
        });
        value = style
      } else if (name.indexOf('data-') === 0) {
        value = attr.value;
        isAttr = true
      } else {
        value = attr.value
      }
      return {
        name: name,
        value: value,
        isAttr: isAttr || false
      }
    }
  },
  function (module, exports) {
    'use strict';
    var properties = {
      'abbr': 'abbr',
      'accept': 'accept',
      'accept-charset': 'acceptCharset',
      'accesskey': 'accessKey',
      'action': 'action',
      'allowfullscreen': 'allowFullScreen',
      'allowtransparency': 'allowTransparency',
      'alt': 'alt',
      'async': 'async',
      'autocomplete': 'autoComplete',
      'autofocus': 'autoFocus',
      'autoplay': 'autoPlay',
      'cellpadding': 'cellPadding',
      'cellspacing': 'cellSpacing',
      'challenge': 'challenge',
      'charset': 'charset',
      'checked': 'checked',
      'cite': 'cite',
      'class': 'className',
      'cols': 'cols',
      'colspan': 'colSpan',
      'command': 'command',
      'content': 'content',
      'contenteditable': 'contentEditable',
      'contextmenu': 'contextMenu',
      'controls': 'controls',
      'coords': 'coords',
      'crossorigin': 'crossOrigin',
      'data': 'data',
      'datetime': 'dateTime',
      'default': 'default',
      'defer': 'defer',
      'dir': 'dir',
      'disabled': 'disabled',
      'download': 'download',
      'draggable': 'draggable',
      'dropzone': 'dropzone',
      'enctype': 'encType',
      'for': 'htmlFor',
      'form': 'form',
      'formaction': 'formAction',
      'formenctype': 'formEncType',
      'formmethod': 'formMethod',
      'formnovalidate': 'formNoValidate',
      'formtarget': 'formTarget',
      'frameBorder': 'frameBorder',
      'headers': 'headers',
      'height': 'height',
      'hidden': 'hidden',
      'high': 'high',
      'href': 'href',
      'hreflang': 'hrefLang',
      'http-equiv': 'httpEquiv',
      'icon': 'icon',
      'id': 'id',
      'inputmode': 'inputMode',
      'ismap': 'isMap',
      'itemid': 'itemId',
      'itemprop': 'itemProp',
      'itemref': 'itemRef',
      'itemscope': 'itemScope',
      'itemtype': 'itemType',
      'kind': 'kind',
      'label': 'label',
      'lang': 'lang',
      'list': 'list',
      'loop': 'loop',
      'manifest': 'manifest',
      'max': 'max',
      'maxlength': 'maxLength',
      'media': 'media',
      'mediagroup': 'mediaGroup',
      'method': 'method',
      'min': 'min',
      'minlength': 'minLength',
      'multiple': 'multiple',
      'muted': 'muted',
      'name': 'name',
      'novalidate': 'noValidate',
      'open': 'open',
      'optimum': 'optimum',
      'pattern': 'pattern',
      'ping': 'ping',
      'placeholder': 'placeholder',
      'poster': 'poster',
      'preload': 'preload',
      'radiogroup': 'radioGroup',
      'readonly': 'readOnly',
      'rel': 'rel',
      'required': 'required',
      'role': 'role',
      'rows': 'rows',
      'rowspan': 'rowSpan',
      'sandbox': 'sandbox',
      'scope': 'scope',
      'scoped': 'scoped',
      'scrolling': 'scrolling',
      'seamless': 'seamless',
      'selected': 'selected',
      'shape': 'shape',
      'size': 'size',
      'sizes': 'sizes',
      'sortable': 'sortable',
      'span': 'span',
      'spellcheck': 'spellCheck',
      'src': 'src',
      'srcdoc': 'srcDoc',
      'srcset': 'srcSet',
      'start': 'start',
      'step': 'step',
      'style': 'style',
      'tabindex': 'tabIndex',
      'target': 'target',
      'title': 'title',
      'translate': 'translate',
      'type': 'type',
      'typemustmatch': 'typeMustMatch',
      'usemap': 'useMap',
      'value': 'value',
      'width': 'width',
      'wmode': 'wmode',
      'wrap': 'wrap'
    };
    module.exports = properties
  },
  function (module, exports) {
    'use strict';
    var DEFAULT_NAMESPACE = null;
    var EV_NAMESPACE = 'http://www.w3.org/2001/xml-events';
    var XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
    var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
    var namespaces = {
      'about': DEFAULT_NAMESPACE,
      'accent-height': DEFAULT_NAMESPACE,
      'accumulate': DEFAULT_NAMESPACE,
      'additive': DEFAULT_NAMESPACE,
      'alignment-baseline': DEFAULT_NAMESPACE,
      'alphabetic': DEFAULT_NAMESPACE,
      'amplitude': DEFAULT_NAMESPACE,
      'arabic-form': DEFAULT_NAMESPACE,
      'ascent': DEFAULT_NAMESPACE,
      'attributeName': DEFAULT_NAMESPACE,
      'attributeType': DEFAULT_NAMESPACE,
      'azimuth': DEFAULT_NAMESPACE,
      'bandwidth': DEFAULT_NAMESPACE,
      'baseFrequency': DEFAULT_NAMESPACE,
      'baseProfile': DEFAULT_NAMESPACE,
      'baseline-shift': DEFAULT_NAMESPACE,
      'bbox': DEFAULT_NAMESPACE,
      'begin': DEFAULT_NAMESPACE,
      'bias': DEFAULT_NAMESPACE,
      'by': DEFAULT_NAMESPACE,
      'calcMode': DEFAULT_NAMESPACE,
      'cap-height': DEFAULT_NAMESPACE,
      'class': DEFAULT_NAMESPACE,
      'clip': DEFAULT_NAMESPACE,
      'clip-path': DEFAULT_NAMESPACE,
      'clip-rule': DEFAULT_NAMESPACE,
      'clipPathUnits': DEFAULT_NAMESPACE,
      'color': DEFAULT_NAMESPACE,
      'color-interpolation': DEFAULT_NAMESPACE,
      'color-interpolation-filters': DEFAULT_NAMESPACE,
      'color-profile': DEFAULT_NAMESPACE,
      'color-rendering': DEFAULT_NAMESPACE,
      'content': DEFAULT_NAMESPACE,
      'contentScriptType': DEFAULT_NAMESPACE,
      'contentStyleType': DEFAULT_NAMESPACE,
      'cursor': DEFAULT_NAMESPACE,
      'cx': DEFAULT_NAMESPACE,
      'cy': DEFAULT_NAMESPACE,
      'd': DEFAULT_NAMESPACE,
      'datatype': DEFAULT_NAMESPACE,
      'defaultAction': DEFAULT_NAMESPACE,
      'descent': DEFAULT_NAMESPACE,
      'diffuseConstant': DEFAULT_NAMESPACE,
      'direction': DEFAULT_NAMESPACE,
      'display': DEFAULT_NAMESPACE,
      'divisor': DEFAULT_NAMESPACE,
      'dominant-baseline': DEFAULT_NAMESPACE,
      'dur': DEFAULT_NAMESPACE,
      'dx': DEFAULT_NAMESPACE,
      'dy': DEFAULT_NAMESPACE,
      'edgeMode': DEFAULT_NAMESPACE,
      'editable': DEFAULT_NAMESPACE,
      'elevation': DEFAULT_NAMESPACE,
      'enable-background': DEFAULT_NAMESPACE,
      'end': DEFAULT_NAMESPACE,
      'ev:event': EV_NAMESPACE,
      'event': DEFAULT_NAMESPACE,
      'exponent': DEFAULT_NAMESPACE,
      'externalResourcesRequired': DEFAULT_NAMESPACE,
      'fill': DEFAULT_NAMESPACE,
      'fill-opacity': DEFAULT_NAMESPACE,
      'fill-rule': DEFAULT_NAMESPACE,
      'filter': DEFAULT_NAMESPACE,
      'filterRes': DEFAULT_NAMESPACE,
      'filterUnits': DEFAULT_NAMESPACE,
      'flood-color': DEFAULT_NAMESPACE,
      'flood-opacity': DEFAULT_NAMESPACE,
      'focusHighlight': DEFAULT_NAMESPACE,
      'focusable': DEFAULT_NAMESPACE,
      'font-family': DEFAULT_NAMESPACE,
      'font-size': DEFAULT_NAMESPACE,
      'font-size-adjust': DEFAULT_NAMESPACE,
      'font-stretch': DEFAULT_NAMESPACE,
      'font-style': DEFAULT_NAMESPACE,
      'font-variant': DEFAULT_NAMESPACE,
      'font-weight': DEFAULT_NAMESPACE,
      'format': DEFAULT_NAMESPACE,
      'from': DEFAULT_NAMESPACE,
      'fx': DEFAULT_NAMESPACE,
      'fy': DEFAULT_NAMESPACE,
      'g1': DEFAULT_NAMESPACE,
      'g2': DEFAULT_NAMESPACE,
      'glyph-name': DEFAULT_NAMESPACE,
      'glyph-orientation-horizontal': DEFAULT_NAMESPACE,
      'glyph-orientation-vertical': DEFAULT_NAMESPACE,
      'glyphRef': DEFAULT_NAMESPACE,
      'gradientTransform': DEFAULT_NAMESPACE,
      'gradientUnits': DEFAULT_NAMESPACE,
      'handler': DEFAULT_NAMESPACE,
      'hanging': DEFAULT_NAMESPACE,
      'height': DEFAULT_NAMESPACE,
      'horiz-adv-x': DEFAULT_NAMESPACE,
      'horiz-origin-x': DEFAULT_NAMESPACE,
      'horiz-origin-y': DEFAULT_NAMESPACE,
      'id': DEFAULT_NAMESPACE,
      'ideographic': DEFAULT_NAMESPACE,
      'image-rendering': DEFAULT_NAMESPACE,
      'in': DEFAULT_NAMESPACE,
      'in2': DEFAULT_NAMESPACE,
      'initialVisibility': DEFAULT_NAMESPACE,
      'intercept': DEFAULT_NAMESPACE,
      'k': DEFAULT_NAMESPACE,
      'k1': DEFAULT_NAMESPACE,
      'k2': DEFAULT_NAMESPACE,
      'k3': DEFAULT_NAMESPACE,
      'k4': DEFAULT_NAMESPACE,
      'kernelMatrix': DEFAULT_NAMESPACE,
      'kernelUnitLength': DEFAULT_NAMESPACE,
      'kerning': DEFAULT_NAMESPACE,
      'keyPoints': DEFAULT_NAMESPACE,
      'keySplines': DEFAULT_NAMESPACE,
      'keyTimes': DEFAULT_NAMESPACE,
      'lang': DEFAULT_NAMESPACE,
      'lengthAdjust': DEFAULT_NAMESPACE,
      'letter-spacing': DEFAULT_NAMESPACE,
      'lighting-color': DEFAULT_NAMESPACE,
      'limitingConeAngle': DEFAULT_NAMESPACE,
      'local': DEFAULT_NAMESPACE,
      'marker-end': DEFAULT_NAMESPACE,
      'marker-mid': DEFAULT_NAMESPACE,
      'marker-start': DEFAULT_NAMESPACE,
      'markerHeight': DEFAULT_NAMESPACE,
      'markerUnits': DEFAULT_NAMESPACE,
      'markerWidth': DEFAULT_NAMESPACE,
      'mask': DEFAULT_NAMESPACE,
      'maskContentUnits': DEFAULT_NAMESPACE,
      'maskUnits': DEFAULT_NAMESPACE,
      'mathematical': DEFAULT_NAMESPACE,
      'max': DEFAULT_NAMESPACE,
      'media': DEFAULT_NAMESPACE,
      'mediaCharacterEncoding': DEFAULT_NAMESPACE,
      'mediaContentEncodings': DEFAULT_NAMESPACE,
      'mediaSize': DEFAULT_NAMESPACE,
      'mediaTime': DEFAULT_NAMESPACE,
      'method': DEFAULT_NAMESPACE,
      'min': DEFAULT_NAMESPACE,
      'mode': DEFAULT_NAMESPACE,
      'name': DEFAULT_NAMESPACE,
      'nav-down': DEFAULT_NAMESPACE,
      'nav-down-left': DEFAULT_NAMESPACE,
      'nav-down-right': DEFAULT_NAMESPACE,
      'nav-left': DEFAULT_NAMESPACE,
      'nav-next': DEFAULT_NAMESPACE,
      'nav-prev': DEFAULT_NAMESPACE,
      'nav-right': DEFAULT_NAMESPACE,
      'nav-up': DEFAULT_NAMESPACE,
      'nav-up-left': DEFAULT_NAMESPACE,
      'nav-up-right': DEFAULT_NAMESPACE,
      'numOctaves': DEFAULT_NAMESPACE,
      'observer': DEFAULT_NAMESPACE,
      'offset': DEFAULT_NAMESPACE,
      'opacity': DEFAULT_NAMESPACE,
      'operator': DEFAULT_NAMESPACE,
      'order': DEFAULT_NAMESPACE,
      'orient': DEFAULT_NAMESPACE,
      'orientation': DEFAULT_NAMESPACE,
      'origin': DEFAULT_NAMESPACE,
      'overflow': DEFAULT_NAMESPACE,
      'overlay': DEFAULT_NAMESPACE,
      'overline-position': DEFAULT_NAMESPACE,
      'overline-thickness': DEFAULT_NAMESPACE,
      'panose-1': DEFAULT_NAMESPACE,
      'path': DEFAULT_NAMESPACE,
      'pathLength': DEFAULT_NAMESPACE,
      'patternContentUnits': DEFAULT_NAMESPACE,
      'patternTransform': DEFAULT_NAMESPACE,
      'patternUnits': DEFAULT_NAMESPACE,
      'phase': DEFAULT_NAMESPACE,
      'playbackOrder': DEFAULT_NAMESPACE,
      'pointer-events': DEFAULT_NAMESPACE,
      'points': DEFAULT_NAMESPACE,
      'pointsAtX': DEFAULT_NAMESPACE,
      'pointsAtY': DEFAULT_NAMESPACE,
      'pointsAtZ': DEFAULT_NAMESPACE,
      'preserveAlpha': DEFAULT_NAMESPACE,
      'preserveAspectRatio': DEFAULT_NAMESPACE,
      'primitiveUnits': DEFAULT_NAMESPACE,
      'propagate': DEFAULT_NAMESPACE,
      'property': DEFAULT_NAMESPACE,
      'r': DEFAULT_NAMESPACE,
      'radius': DEFAULT_NAMESPACE,
      'refX': DEFAULT_NAMESPACE,
      'refY': DEFAULT_NAMESPACE,
      'rel': DEFAULT_NAMESPACE,
      'rendering-intent': DEFAULT_NAMESPACE,
      'repeatCount': DEFAULT_NAMESPACE,
      'repeatDur': DEFAULT_NAMESPACE,
      'requiredExtensions': DEFAULT_NAMESPACE,
      'requiredFeatures': DEFAULT_NAMESPACE,
      'requiredFonts': DEFAULT_NAMESPACE,
      'requiredFormats': DEFAULT_NAMESPACE,
      'resource': DEFAULT_NAMESPACE,
      'restart': DEFAULT_NAMESPACE,
      'result': DEFAULT_NAMESPACE,
      'rev': DEFAULT_NAMESPACE,
      'role': DEFAULT_NAMESPACE,
      'rotate': DEFAULT_NAMESPACE,
      'rx': DEFAULT_NAMESPACE,
      'ry': DEFAULT_NAMESPACE,
      'scale': DEFAULT_NAMESPACE,
      'seed': DEFAULT_NAMESPACE,
      'shape-rendering': DEFAULT_NAMESPACE,
      'slope': DEFAULT_NAMESPACE,
      'snapshotTime': DEFAULT_NAMESPACE,
      'spacing': DEFAULT_NAMESPACE,
      'specularConstant': DEFAULT_NAMESPACE,
      'specularExponent': DEFAULT_NAMESPACE,
      'spreadMethod': DEFAULT_NAMESPACE,
      'startOffset': DEFAULT_NAMESPACE,
      'stdDeviation': DEFAULT_NAMESPACE,
      'stemh': DEFAULT_NAMESPACE,
      'stemv': DEFAULT_NAMESPACE,
      'stitchTiles': DEFAULT_NAMESPACE,
      'stop-color': DEFAULT_NAMESPACE,
      'stop-opacity': DEFAULT_NAMESPACE,
      'strikethrough-position': DEFAULT_NAMESPACE,
      'strikethrough-thickness': DEFAULT_NAMESPACE,
      'string': DEFAULT_NAMESPACE,
      'stroke': DEFAULT_NAMESPACE,
      'stroke-dasharray': DEFAULT_NAMESPACE,
      'stroke-dashoffset': DEFAULT_NAMESPACE,
      'stroke-linecap': DEFAULT_NAMESPACE,
      'stroke-linejoin': DEFAULT_NAMESPACE,
      'stroke-miterlimit': DEFAULT_NAMESPACE,
      'stroke-opacity': DEFAULT_NAMESPACE,
      'stroke-width': DEFAULT_NAMESPACE,
      'surfaceScale': DEFAULT_NAMESPACE,
      'syncBehavior': DEFAULT_NAMESPACE,
      'syncBehaviorDefault': DEFAULT_NAMESPACE,
      'syncMaster': DEFAULT_NAMESPACE,
      'syncTolerance': DEFAULT_NAMESPACE,
      'syncToleranceDefault': DEFAULT_NAMESPACE,
      'systemLanguage': DEFAULT_NAMESPACE,
      'tableValues': DEFAULT_NAMESPACE,
      'target': DEFAULT_NAMESPACE,
      'targetX': DEFAULT_NAMESPACE,
      'targetY': DEFAULT_NAMESPACE,
      'text-anchor': DEFAULT_NAMESPACE,
      'text-decoration': DEFAULT_NAMESPACE,
      'text-rendering': DEFAULT_NAMESPACE,
      'textLength': DEFAULT_NAMESPACE,
      'timelineBegin': DEFAULT_NAMESPACE,
      'title': DEFAULT_NAMESPACE,
      'to': DEFAULT_NAMESPACE,
      'transform': DEFAULT_NAMESPACE,
      'transformBehavior': DEFAULT_NAMESPACE,
      'type': DEFAULT_NAMESPACE,
      'typeof': DEFAULT_NAMESPACE,
      'u1': DEFAULT_NAMESPACE,
      'u2': DEFAULT_NAMESPACE,
      'underline-position': DEFAULT_NAMESPACE,
      'underline-thickness': DEFAULT_NAMESPACE,
      'unicode': DEFAULT_NAMESPACE,
      'unicode-bidi': DEFAULT_NAMESPACE,
      'unicode-range': DEFAULT_NAMESPACE,
      'units-per-em': DEFAULT_NAMESPACE,
      'v-alphabetic': DEFAULT_NAMESPACE,
      'v-hanging': DEFAULT_NAMESPACE,
      'v-ideographic': DEFAULT_NAMESPACE,
      'v-mathematical': DEFAULT_NAMESPACE,
      'values': DEFAULT_NAMESPACE,
      'version': DEFAULT_NAMESPACE,
      'vert-adv-y': DEFAULT_NAMESPACE,
      'vert-origin-x': DEFAULT_NAMESPACE,
      'vert-origin-y': DEFAULT_NAMESPACE,
      'viewBox': DEFAULT_NAMESPACE,
      'viewTarget': DEFAULT_NAMESPACE,
      'visibility': DEFAULT_NAMESPACE,
      'width': DEFAULT_NAMESPACE,
      'widths': DEFAULT_NAMESPACE,
      'word-spacing': DEFAULT_NAMESPACE,
      'writing-mode': DEFAULT_NAMESPACE,
      'x': DEFAULT_NAMESPACE,
      'x-height': DEFAULT_NAMESPACE,
      'x1': DEFAULT_NAMESPACE,
      'x2': DEFAULT_NAMESPACE,
      'xChannelSelector': DEFAULT_NAMESPACE,
      'xlink:actuate': XLINK_NAMESPACE,
      'xlink:arcrole': XLINK_NAMESPACE,
      'xlink:href': XLINK_NAMESPACE,
      'xlink:role': XLINK_NAMESPACE,
      'xlink:show': XLINK_NAMESPACE,
      'xlink:title': XLINK_NAMESPACE,
      'xlink:type': XLINK_NAMESPACE,
      'xml:base': XML_NAMESPACE,
      'xml:id': XML_NAMESPACE,
      'xml:lang': XML_NAMESPACE,
      'xml:space': XML_NAMESPACE,
      'y': DEFAULT_NAMESPACE,
      'y1': DEFAULT_NAMESPACE,
      'y2': DEFAULT_NAMESPACE,
      'yChannelSelector': DEFAULT_NAMESPACE,
      'z': DEFAULT_NAMESPACE,
      'zoomAndPan': DEFAULT_NAMESPACE
    };
    module.exports = namespaces
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var Rx = __webpack_require__(2);
    var VirtualNode = __webpack_require__(9);
    function transposeVTree(vtree) {
      if (typeof vtree.subscribe === 'function') {
        return vtree.flatMapLatest(transposeVTree)
      } else if (vtree.type === 'VirtualText') {
        return Rx.Observable.just(vtree)
      } else if (vtree.type === 'VirtualNode' && Array.isArray(vtree.children) && vtree.children.length > 0) {
        return Rx.Observable.combineLatest(vtree.children.map(transposeVTree), function () {
          for (var _len = arguments.length, arr = Array(_len), _key = 0; _key < _len; _key++) {
            arr[_key] = arguments[_key]
          }
          return new VirtualNode(vtree.tagName, vtree.properties, arr, vtree.key, vtree.namespace)
        })
      } else if (vtree.type === 'VirtualNode' || vtree.type === 'Widget' || vtree.type === 'Thunk') {
        return Rx.Observable.just(vtree)
      } else {
        throw new Error('Unhandled case in transposeVTree()')
      }
    }
    module.exports = { transposeVTree: transposeVTree }
  },
  function (module, exports) {
    'use strict';
    var proto = Element.prototype;
    var vendor = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector;
    module.exports = match;
    function match(el, selector) {
      if (vendor)
        return vendor.call(el, selector);
      var nodes = el.parentNode.querySelectorAll(selector);
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] == el)
          return true
      }
      return false
    }
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    var Rx = __webpack_require__(2);
    var toHTML = __webpack_require__(49);
    var _require = __webpack_require__(46);
    var transposeVTree = _require.transposeVTree;
    function makeBogusSelect() {
      return function select() {
        return {
          observable: Rx.Observable.empty(),
          events: function events() {
            return Rx.Observable.empty()
          }
        }
      }
    }
    function makeHTMLDriver() {
      return function htmlDriver(vtree$) {
        var output$ = vtree$.flatMapLatest(transposeVTree).last().map(toHTML);
        output$.select = makeBogusSelect();
        return output$
      }
    }
    module.exports = {
      makeBogusSelect: makeBogusSelect,
      makeHTMLDriver: makeHTMLDriver
    }
  },
  function (module, exports, __webpack_require__) {
    var escape = __webpack_require__(50);
    var extend = __webpack_require__(51);
    var isVNode = __webpack_require__(11);
    var isVText = __webpack_require__(16);
    var isThunk = __webpack_require__(13);
    var isWidget = __webpack_require__(12);
    var softHook = __webpack_require__(19);
    var attrHook = __webpack_require__(25);
    var paramCase = __webpack_require__(52);
    var createAttribute = __webpack_require__(58);
    var voidElements = __webpack_require__(60);
    module.exports = toHTML;
    function toHTML(node, parent) {
      if (!node)
        return '';
      if (isThunk(node)) {
        node = node.render()
      }
      if (isWidget(node) && node.render) {
        node = node.render()
      }
      if (isVNode(node)) {
        return openTag(node) + tagContent(node) + closeTag(node)
      } else if (isVText(node)) {
        if (parent && parent.tagName.toLowerCase() === 'script')
          return String(node.text);
        return escape(String(node.text))
      }
      return ''
    }
    function tagContent(node) {
      var innerHTML = node.properties.innerHTML;
      if (innerHTML != null)
        return innerHTML;
      else {
        var ret = '';
        if (node.children && node.children.length) {
          for (var i = 0, l = node.children.length; i < l; i++) {
            var child = node.children[i];
            ret += toHTML(child, node)
          }
        }
        return ret
      }
    }
  },
  function (module, exports) {
    'use strict';
    var matchHtmlRegExp = /["'&<>]/;
    module.exports = escapeHtml;
    function escapeHtml(string) {
      var str = '' + string;
      var match = matchHtmlRegExp.exec(str);
      if (!match) {
        return str
      }
      var escape;
      var html = '';
      var index = 0;
      var lastIndex = 0;
      for (index = match.index; index < str.length; index++) {
        switch (str.charCodeAt(index)) {
        case 34:
          escape = '&quot;';
          break;
        case 38:
          escape = '&amp;';
          break;
        case 39:
          escape = '&#39;';
          break;
        case 60:
          escape = '&lt;';
          break;
        case 62:
          escape = '&gt;';
          break;
        default:
          continue
        }
        if (lastIndex !== index) {
          html += str.substring(lastIndex, index)
        }
        lastIndex = index + 1;
        html += escape
      }
      return lastIndex !== index ? html + str.substring(lastIndex, index) : html
    }
  },
  function (module, exports) {
    module.exports = extend;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function extend() {
      var target = {};
      for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            target[key] = source[key]
          }
        }
      }
      return target
    }
  },
  function (module, exports, __webpack_require__) {
    var sentenceCase = __webpack_require__(53);
    module.exports = function (string, locale) {
      return sentenceCase(string, locale, '-')
    }
  },
  function (module, exports, __webpack_require__) {
    var lowerCase = __webpack_require__(54);
    var NON_WORD_REGEXP = __webpack_require__(55);
    var CAMEL_CASE_REGEXP = __webpack_require__(56);
    var TRAILING_DIGIT_REGEXP = __webpack_require__(57);
    module.exports = function (str, locale, replacement) {
      if (str == null) {
        return ''
      }
      replacement = replacement || ' ';
      str = String(str).replace(CAMEL_CASE_REGEXP, '$1 $2').replace(TRAILING_DIGIT_REGEXP, '$1 $2').replace(NON_WORD_REGEXP, replace);
      return lowerCase(str, locale)
    }
  },
  function (module, exports) {
    var LANGUAGES = {
      tr: {
        regexp: /\u0130|\u0049|\u0049\u0307/g,
        map: {
          'İ': 'i',
          'I': 'ı',
          'İ': 'i'
        }
      },
      az: {
        regexp: /[\u0130]/g,
        map: {
          'İ': 'i',
          'I': 'ı',
          'İ': 'i'
        }
      },
      lt: {
        regexp: /[\u0049\u004A\u012E\u00CC\u00CD\u0128]/g,
        map: {
          'I': 'i̇',
          'J': 'j̇',
          'Į': 'į̇',
          'Ì': 'i̇̀',
          'Í': 'i̇́',
          'Ĩ': 'i̇̃'
        }
      }
    };
    module.exports = function (str, locale) {
      var lang = LANGUAGES[locale];
      str = str == null ? '' : String(str);
      if (lang) {
        str = str.replace(lang.regexp, function (m) {
          return lang.map[m]
        })
      }
      return str.toLowerCase()
    }
  },
  function (module, exports) {
    module.exports = /[^\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]+/g
  },
  function (module, exports) {
    module.exports = /([\u0061-\u007A\u00B5\u00DF-\u00F6\u00F8-\u00FF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0561-\u0587\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7FA\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A])([\u0041-\u005A\u00C0-\u00D6\u00D8-\u00DE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA\uFF21-\uFF3A\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])/g
  },
  function (module, exports) {
    module.exports = /([\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])([^\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])/g
  },
  function (module, exports, __webpack_require__) {
    var escape = __webpack_require__(50);
    var propConfig = __webpack_require__(59);
    var types = propConfig.attributeTypes;
    var properties = propConfig.properties;
    var attributeNames = propConfig.attributeNames;
    var prefixAttribute = memoizeString();
    module.exports = createAttribute;
    function createAttribute(name, value, isAttribute) {
      if (properties.hasOwnProperty(name)) {
        if (shouldSkip(name, value))
          return '';
        name = (attributeNames[name] || name).toLowerCase();
        var attrType = properties[name];
        if (attrType === types.BOOLEAN || attrType === types.OVERLOADED_BOOLEAN && value === true) {
          return escape(name)
        }
        return prefixAttribute(name) + escape(value) + '"'
      } else if (isAttribute) {
        if (value == null)
          return '';
        return prefixAttribute(name) + escape(value) + '"'
      }
      return null
    }
    function memoizeString(callback) {
      var cache = {};
      return function (string) {
        if (cache.hasOwnProperty(string)) {
          return cache[string]
        } else {
          return cache[string] = callback.call(this, string)
        }
      }
    }
  },
  function (module, exports) {
    var types = {
      BOOLEAN: 1,
      OVERLOADED_BOOLEAN: 2
    };
    var properties = {
      accept: true,
      acceptCharset: true,
      accessKey: true,
      action: true,
      allowFullScreen: types.BOOLEAN,
      allowTransparency: true,
      alt: true,
      async: types.BOOLEAN,
      autocomplete: true,
      autofocus: types.BOOLEAN,
      autoplay: types.BOOLEAN,
      cellPadding: true,
      cellSpacing: true,
      charset: true,
      checked: types.BOOLEAN,
      classID: true,
      className: true,
      cols: true,
      colSpan: true,
      content: true,
      contentEditable: true,
      contextMenu: true,
      controls: types.BOOLEAN,
      coords: true,
      crossOrigin: true,
      data: true,
      dateTime: true,
      defer: types.BOOLEAN,
      dir: true,
      disabled: types.BOOLEAN,
      download: types.OVERLOADED_BOOLEAN,
      draggable: true,
      enctype: true,
      form: true,
      formAction: true,
      formEncType: true,
      formMethod: true,
      formNoValidate: types.BOOLEAN,
      formTarget: true,
      frameBorder: true,
      headers: true,
      height: true,
      hidden: types.BOOLEAN,
      href: true,
      hreflang: true,
      htmlFor: true,
      httpEquiv: true,
      icon: true,
      id: true,
      label: true,
      lang: true,
      list: true,
      loop: types.BOOLEAN,
      manifest: true,
      marginHeight: true,
      marginWidth: true,
      max: true,
      maxLength: true,
      media: true,
      mediaGroup: true,
      method: true,
      min: true,
      multiple: types.BOOLEAN,
      muted: types.BOOLEAN,
      name: true,
      noValidate: types.BOOLEAN,
      open: true,
      pattern: true,
      placeholder: true,
      poster: true,
      preload: true,
      radiogroup: true,
      readOnly: types.BOOLEAN,
      rel: true,
      required: types.BOOLEAN,
      role: true,
      rows: true,
      rowSpan: true,
      sandbox: true,
      scope: true,
      scrolling: true,
      seamless: types.BOOLEAN,
      selected: types.BOOLEAN,
      shape: true,
      size: true,
      sizes: true,
      span: true,
      spellcheck: true,
      src: true,
      srcdoc: true,
      srcset: true,
      start: true,
      step: true,
      style: true,
      tabIndex: true,
      target: true,
      title: true,
      type: true,
      useMap: true,
      value: true,
      width: true,
      wmode: true,
      autocapitalize: true,
      autocorrect: true,
      itemProp: true,
      itemScope: types.BOOLEAN,
      itemType: true,
      property: true
    };
    var attributeNames = {
      acceptCharset: 'accept-charset',
      className: 'class',
      htmlFor: 'for',
      httpEquiv: 'http-equiv'
    };
    module.exports = {
      attributeTypes: types,
      properties: properties,
      attributeNames: attributeNames
    }
  },
  function (module, exports) {
    module.exports = {
      'area': true,
      'base': true,
      'br': true,
      'col': true,
      'embed': true,
      'hr': true,
      'img': true,
      'input': true,
      'keygen': true,
      'link': true,
      'meta': true,
      'param': true,
      'source': true,
      'track': true,
      'wbr': true
    }
  },
  function (module, exports, __webpack_require__) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { 'default': obj }
    }
    var _rx = __webpack_require__(2);
    var _rx2 = _interopRequireDefault(_rx);
    var emptyStream = _rx2['default'].Observable.empty();
    function makeMockSelector(mockedSelectors) {
      return function select(selector) {
        for (var key in mockedSelectors) {
          if (mockedSelectors.hasOwnProperty(key) && key === selector) {
            var observable = emptyStream;
            if (mockedSelectors[key].hasOwnProperty('observable')) {
              observable = mockedSelectors[key].observable
            }
            return {
              observable: observable,
              select: makeMockSelector(mockedSelectors[key]),
              events: getEventsStreamForSelector(mockedSelectors[key])
            }
          }
        }
        return {
          observable: emptyStream,
          select: makeMockSelector(mockedSelectors),
          events: function events() {
            return emptyStream
          }
        }
      }
    }
    function mockDOMSource() {
      var mockedSelectors = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      return {
        observable: emptyStream,
        select: makeMockSelector(mockedSelectors),
        events: function events() {
          return emptyStream
        }
      }
    }
    exports['default'] = mockDOMSource;
    module.exports = exports['default']
  },
  function (module, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var isValidString = function isValidString(param) {
      return typeof param === 'string' && param.length > 0
    };
    var startsWith = function startsWith(string, start) {
      return string[0] === start
    };
    var isSelector = function isSelector(param) {
      return isValidString(param) && (startsWith(param, '.') || startsWith(param, '#'))
    };
    var node = function node(h) {
      return function (tagName) {
        return function (first) {
          for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            rest[_key - 1] = arguments[_key]
          }
          if (isSelector(first)) {
            return h.apply(undefined, [tagName + first].concat(rest))
          } else {
            return h.apply(undefined, [
              tagName,
              first
            ].concat(rest))
          }
        }
      }
    };
    var TAG_NAMES = [
      'a',
      'abbr',
      'address',
      'area',
      'article',
      'aside',
      'audio',
      'b',
      'base',
      'bdi',
      'bdo',
      'blockquote',
      'body',
      'br',
      'button',
      'canvas',
      'caption',
      'cite',
      'code',
      'col',
      'colgroup',
      'dd',
      'del',
      'dfn',
      'dir',
      'div',
      'dl',
      'dt',
      'em',
      'embed',
      'fieldset',
      'figcaption',
      'figure',
      'footer',
      'form',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'head',
      'header',
      'hgroup',
      'hr',
      'html',
      'i',
      'iframe',
      'img',
      'input',
      'ins',
      'kbd',
      'keygen',
      'label',
      'legend',
      'li',
      'link',
      'main',
      'map',
      'mark',
      'menu',
      'meta',
      'nav',
      'noscript',
      'object',
      'ol',
      'optgroup',
      'option',
      'p',
      'param',
      'pre',
      'q',
      'rp',
      'rt',
      'ruby',
      's',
      'samp',
      'script',
      'section',
      'select',
      'small',
      'source',
      'span',
      'strong',
      'style',
      'sub',
      'sup',
      'table',
      'tbody',
      'td',
      'textarea',
      'tfoot',
      'th',
      'thead',
      'title',
      'tr',
      'u',
      'ul',
      'video'
    ];
    exports['default'] = function (h) {
      var createTag = node(h);
      var exported = {
        TAG_NAMES: TAG_NAMES,
        isSelector: isSelector,
        createTag: createTag
      };
      TAG_NAMES.forEach(function (n) {
        exported[n] = createTag(n)
      });
      return exported
    };
    module.exports = exports['default']
  }
]))