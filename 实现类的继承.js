//原型链式继承
//父类
function Parent(name){
    this.parent = name
}
Parent.prototype.say = function(){
    console.log(`${this.parent}：你好`)
}
Parent.prototype.sayBad = function(){
    console.log(`${this.parent}：你不好`)
}
function Child(name,parent){
    //将父类的构造函数绑定到子类上
    Parent.call(this,parent)
    this.child = name
}
/**
 * 不用Child.prototype = Parent.prototype的原因是怕共享内存，修改父类原型对象就会影响子类
 * 不用Child.prototype = new Parent()的原因是会调用2次父类的构造方法（另一次是call），会存在一份多余的父类实例属性
 * Object.create是创建了父类原型的副本，与父类原型完全隔离
 */
Child.prototype = Object.create(Parent.prototype)
Child.prototype.say = function(){
    console.log('你也好')
}

//把子类的构造函数指向子类本身
Child.prototype.constructor = Child

var parent = new Parent('父')
parent.say()

var child = new Child('子','父')
child.say()
child.sayBad()