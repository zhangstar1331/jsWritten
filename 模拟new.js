/**
 * new操作符做了以下这些事
 * 1、它创建了一个全新的对象
 * 2、它会被执行[[Prototype]](也就是proto)链接
 * 3、它使this指向新创建的对象
 * 4、通过new创建的每个对象将最终被[[Prototype]]链接到这个函数的prototype对象上
 * 5、如果函数没有返回对象类型Object（包含Function、Array、Date、RegExp、Error），那么new表达式中的函数调用将返回该对象引用
 */
function objectFactory(){
    const obj = new Object()
    const Constructor = [].shift.call(arguments) //获取第一个参数
    obj.__proto__ = Constructor.prototype //原型继承绑定
    const ret = Constructor.apply(obj, arguments) //修改this指向
    return typeof ret === "object" ? ret : obj
}
function Animal(name){
    this.name = name
}
const obj = objectFactory(Animal,'dog')
console.log(obj.name) //dog