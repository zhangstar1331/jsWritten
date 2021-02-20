function instance_of(L, R){
    //L表示左表达式，R表示右表达式
    var O = R.prototype //取R的显示原型
    L = L.__proto__ //取L的隐式原型
    while(true){
        if(L === null) return false
        if(O === L) return true
        L = L.__proto__
    }
}
class Dog {

}
const dog = new Dog()
console.log(instance_of(dog,Dog)) //true