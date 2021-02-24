//实现
var Promise = (function () {
    function Promise(executor) {
        var self = this
        self.status = "pending" //Promise当前状态
        self.data = undefined //Promise的值
        self.onResolvedCallback = [] //Promise resolve时的回调函数集
        self.onRejectedCallback = [] //Promise reject时的回调函数集

        //成功处理
        function resolve(value) {
            if (value instanceof Promise) {
                return value.then(resolve, reject)
            }
            setTimeout(function () {//promise.then(onResolved, onRejected)里的这两项函数需要异步调用，让executor函数立即执行
                if (self.status === 'pending') {
                    self.status = 'resolved'
                    self.data = value
                    //执行回调函数集
                    for (var i = 0; i < self.onResolvedCallback.length; i++) {
                        self.onResolvedCallback[i](value)
                    }
                }
            })
        }

        //失败处理
        function reject(reason) {
            setTimeout(function () {
                if (self.status === 'pending') {
                    self.status = 'rejected'
                    self.data = reason
                    if (self.onRejectedCallback.length === 0) {
                        console.log(reason)
                    }
                    //执行回调函数集
                    for (var i = 0; i < self.onRejectedCallback.length; i++) {
                        self.onRejectedCallback[i](reason)
                    }
                }
            })
        }

        //executor执行过程中可能会出错，需要reject抛出错误    
        try {
            executor(resolve, reject)
        } catch (e) {
            reject(e)
        }
    }

    /**
     * 不同Promise交互
     * 针对onResolved/onRejected的返回值x(即thenable)，要以最保险的方式调用x上的then方法
     */
    //resolvePromise函数即为根据x的值来决定promise2的状态的函数
    function resolvePromise(promise2, x, resolve, reject) {
        var then
        var thenCalledOrThrow = false

        if (promise2 === x) {//对应标准2.3.1节
            return reject(new TypeError('Chaining cycle detected for promise'))
        }

        if (x instanceof Promise) {//对应标准2.3.2节
            //如果x的状态还没有确定，那么它是有可能被一个thenable决定最终状态和值的
            //所以这里需要做一下处理，不能一概的以为它会是一个“正常”的值resolve
            if (x.status === 'pending') {
                x.then(function (value) {
                    resolvePromise(promise2, value, resolve, reject)
                }, reject)
            } else {
                //但如果这个Promise的状态已经确定了，那么它肯定有一个“正常”的值
                x.then(resolve, reject)
            }
            return
        }

        if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {//2.3.3
            try {
                //2.3.3.1因为x.then有可能是一个getter，这种情况下多次读取就有可能产生副作用
                //既要判断它的类型，又要调用它，这就是两次读取
                then = x.then
                if (typeof then === 'function') {//2.3.3.3
                    then.call(x, function rs(y) {//2.3.3.3.1
                        if (thenCalledOrThrow) return //2.3.3.3.3,这三处谁先执行就以谁的结果为准
                        thenCalledOrThrow = true
                        return resolvePromise(promise2, y, resolve, reject)
                    }, function rj(r) {//2.3.3.3.2
                        if (thenCalledOrThrow) return //2.3.3.3.3,这三处谁先执行就以谁的结果为准
                        thenCalledOrThrow = true
                        return reject(r)
                    })
                } else {//2.3.3.4
                    resolve(x)
                }
            } catch (e) {
                if (thenCalledOrThrow) return //2.3.3.3.3,这三处谁先执行就以谁的结果为准
                thenCalledOrThrow = true
                return reject(e)
            }
        } else {//2.3.4
            resolve(x)
        }
    }

    //接收两个参数，分别为Promise成功或失败后的回调
    Promise.prototype.then = function (onResolved, onRejected) {
        var self = this
        var promise2

        //根据标准，如果then的参数不是function，则需要忽略它
        onResolved = typeof onResolved === 'function' ? onResolved : function (value) { return value }
        onRejected = typeof onRejected === 'function' ? onRejected : function (reason) { throw reason }

        //分别处理三种可能的状态，then的返回结果依然是一个promise
        if (self.status === 'resolved') {
            //如果promise1(此处为this/self)的状态应确定并且是resolved，所以调用onResolved
            //考虑到可能的throw，用try/catch处理
            return promise2 = new Promise(function (resolve, reject) {
                setTimeout(function () {//异步执行
                    try {
                        var x = onResolved(self.data)
                        //如果onResolved的返回值是一个Promise对象，直接取它的结果作为promise2的结果
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        }

        if (self.status === 'rejected') {
            return promise2 = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    try {
                        var x = onRejected(self.data)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        }

        if (self.status === 'pending') {
            return promise2 = new Promise(function (resolve, reject) {
                //此时不能确定调用onResolved还是onRejected，只能等到状态确定后再处理
                //需要把两种情况的处理逻辑作为callback放入promise1的回调数组里
                self.onResolvedCallback.push(function (value) {
                    try {
                        var x = onResolved(self.data)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
                self.onRejectedCallback.push(function (value) {
                    try {
                        var x = onRejected(self.data)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        }
    }
    Promise.prototype.catch = function (onRejected) {
        return this.then(null, onRejected)
    }
    Promise.deferred = Promise.defer = function () {
        var dfd = {}
        dfd.promise = new Promise(function (resolve, reject) {
            dfd.resolve = resolve
            dfd.reject = reject
        })
        return dfd
    }
    //用于检测错误，阻断promise链的执行
    //缺点是会造成内存泄露，返回一个永远处于pending状态的Promise，之后的Promise链上的所有Promise都将处于pending状态，这意味着后面所有的回调函数的内存将一直得不到释放
    Promise.cancel = function () {
        return new Promise(function () { })
    }

    Promise.prototype.valueof = function () {
        return this.data
    }

    Promise.prototype.finally = function (fn) {
        //这个then里调用fn又异步了一次，所以它总是最后调用
        return this.then(function (v) {
            setTimeout(fn)
            return v
        }, function (r) {
            setTimeout(fn)
            return r
        })
    }

    Promise.prototype.spread = function (fn, onRejected) {
        return this.then(function () {
            return fn.apply(null, values)
        }, onRejected)
    }

    Promise.prototype.inject = function (fn, onRejected) {
        return this.then(function (v) {
            return fn.apply(null, fn.toString().match(/\((.*?)\)/)[1].split(',').map(function (key) {
                return v[key]
            }))
        }, onRejected)
    }

    Promise.prototype.delay = function (duration) {
        return this.then(function (v) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(v)
                }, duration)
            })
        }, function (r) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    reject(r)
                }, duration)
            })
        })
    }

    Promise.all = function (promises) {
        return new Promise(function (resolve, reject) {
            var resolvedCounter = 0
            var promiseNum = promises.length
            var resolvedValues = new Array(promiseNum)
            for (var i = 0; i < promiseNum; i++) {
                (function (i) {
                    Promise.resolve(promises[i]).then(function (value) {
                        resolvedCounter++
                        resolvedValues[i] = value
                        if (resolvedCounter == promiseNum) {
                            return resolve(resolvedValues)
                        }
                    }, function (reason) {
                        return (reason)
                    })
                })(i)
            }
        })
    }

    Promise.race = function (promises) {
        return new Promise(function (resolve, reject) {
            for (var i = 0; i < promises.length; i++) {
                Promise.resolve(promises[i]).then(function (value) {
                    return resolve(value)
                }, function (reason) {
                    return (reason)
                })
            }
        })
    }

    Promise.resolve = function (value) {
        var promise = new Promise(function (resolve, reject) {
            resolvePromise(promise, value, resolve, reject)
        })
        return promise
    }

    Promise.reject = function (reason) {
        var promise = new Promise(function (resolve, reject) {
            reject(reason)
        })
    }

    Promise.fcall = function (fn) {
        //虽然fn可以接收到上一层then里传来的参数，但是其实是undefined，因为resolve没参数
        return Promise.resolve().then(fn)
    }

    try {
        module.xeports = Promise
    } catch (e) { }

    return Promise
})()



//解决上面内存泄露问题,同时实现多分支跳转
//重写then方法，闭包里的对象外界是访问不到的，外界也永远无法构造出一个跟闭包里Symbol一样的对象
(function () {
    var STOP_VALUE = Symbol()//构造一个Symbol以表达特殊语义
    var STOPPER_PROMISE = Promise.resolve(STOP_VALUE)
    var DONE = {}
    var WARN = {}
    var ERROR = {}
    var EXCEPTION = {}
    var PROMISE_PATCH = {}
    Promise.prototype._then = Promise.prototype.then//保留原本的then方法
    Promise.prototype.then = function (onResolved, onRejected) {
        return this._then(function (value) {//停掉后面的Promise链回调
            return value === STOP_VALUE ? STOP_VALUE : onResolved(value)
        }, onRejected)
    }
    Promise.stop = function () {//跳过后面所有的promise
        return STOPPER_PROMISE //不是每次返回一个新的Promise，可以节省内存
    }
    Promise.done = function (value) {
        return Promise.resolve({
            flag: DONE,
            value
        })
    }
    Promise.warn = function (value) {
        return Promise.resolve({
            flag: WARN,
            value
        })
    }
    Promise.error = function (value) {
        return Promise.resolve({
            flag: ERROR,
            value
        })
    }
    Promise.exception = function (value) {
        return Promise.resolve({
            flag: EXCEPTION,
            value
        })
    }
    Promise.prototype.done = function (cb) {
        return this.then(result => {
            if (result && result.flag === DONE) {
                return cb(result.value)
            } else {
                return result
            }
        })
    }
    Promise.prototype.warn = function (cb) {
        return this.then(result => {
            if (result && result.flag === WARN) {
                return cb(result.value)
            } else {
                return result
            }
        })
    }
    Promise.prototype.error = function (cb) {
        return this.then(result => {
            if (result && result.flag === ERROR) {
                return cb(result.value)
            } else {
                return result
            }
        })
    }
    Promise.prototype.exception = function (cb) {
        return this.then(result => {
            if (result && result.flag === EXCEPTION) {
                return cb(result.value)
            } else {
                return result
            }
        })
    }
}())