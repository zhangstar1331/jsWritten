/**
 * call做了什么
 * 1、将函数设为对象的属性
 * 2、执行&删除这个函数
 * 3、指定this到函数并传入给定参数执行函数
 * 4、如果不传参数，默认指向为window
 */
Function.prototype.call = function(context, ...args){
    context = Object(context) || window
    context.fn = this
    const result = context.fn(...args)
    delete context.fn
    return result
}