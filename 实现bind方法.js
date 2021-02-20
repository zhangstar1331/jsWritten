/**
 * bind做了什么
 * 1、返回一个函数，绑定this，传递预置参数
 * 2、bind返回的函数可以作为构造函数使用，故作为构造函数时应使得this失效，但传入的参数依然有效
 */
Function.prototype.bind = function (oThis) {
    if (typeof this !== 'function') {
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable')
    }
    let aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () { },
        fBound = function () {
            //this instanceof fBound === true时，说明返回的fBound被当做new的构造函数调用
            return fToBind.apply(this instanceof fBound ? this : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments)))
        }
    //维护原型关系
    if(this.prototype){
        fNOP.prototype = this.prototype
    }
    //下行的代码使fBound.prototype是fNOP的实例
    //因此返回的fBound若作为new的构造函数，new生成的新对象作为this传入fBound，新对象的__proto__就是fNOP的实例
    fBound.prototype = new fNOP()
    return fBound
}

//使用闭包+apply实现
Function.prototype.bind = function(context){
    const args1 = Array.from(arguments)
    return (...args2)=>this.apply(context,[...args1,...args2])
}