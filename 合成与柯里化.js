//合成
function f1(){
    console.log(111111)
}
function f2(){
    console.log(222222)
}
function f3(){
    console.log(333333)
}
function compose(...funs){
    if(funs.length === 0){
        return arg => arg
    }
    if(funs.length === 1){
        return funs[0]
    }
    return funs.reduce((a,b) => (...args) => a(b(...args)))
}
compose(f1,f2,f3)()


//柯里化
console.log(add(1)(2)(3))
console.log(add(1,2,3)(4))
console.log(add(1)(2)(3)(4)(5))

function add(){
    let _args = Array.from(arguments)
    let _adder = function(){
        _args.push(...arguments)
        return _adder
    }
    _adder.toString = function(){
        return _args.reduce((a,b)=>a+b)
    }
    return _adder
}