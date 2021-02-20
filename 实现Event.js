/**
 * event bus（订阅发布设计模式）
 * node中各个模块的基石
 * 前端组件通信的依赖手段之一
 */

//简单版
class EventEmeitter {
    constructor() {
        this._events = this._events || new Map() //储存事件，回调键值对
        this._maxListeners = this._maxListeners || 10 //设立监听上限
    }
}
//触发名为type的事件
EventEmeitter.prototype.emit = function(type, ...args){
    let handler
    //从储存事件键值对的this._events中获取对应事件回调函数
    handler = this._events.get(type)
    if(Array.isArray(handler)){
        //如果是一个数组，说明有多个监听者，需要依次触发里面的函数
        for(let i = 0; i < handler.length; i++){
            if(args.length>0){
                handler[i].apply(this,args)
            }else{
                handler[i].call(this)
            }
        }
    }else{
        if(args.length>0){
            handler.apply(this,args)
        }else{
            handler.call(this)
        }
    }
    return true
}
//监听名为type的事件
EventEmeitter.prototype.addListener = function (type, fn) {
    //获取对应事件名称的函数清单  
    const handler = this._events.get(type)
    if(!handler){
        this._events.set(type,fn)
    } else if(handler && typeof handler === "function"){
        //如果handler是函数，说明只有一个监听者
        this._events.set(type,[handler,fn])
    }else{
        //存在多个监听者
        handler.push(fn)
    }
}

EventEmeitter.prototype.removeListener = function(type, fn){
    //获取对应事件名称的函数清单
    const handler = this._events.get(type)
    //如果是函数，说明只被监听了一次
    if(handler&&typeof handler === "function"){
        this._events.delete(type,fn)
    }else{
        let postion
        //如果是数组，说明被监听多次要找到对应的函数
        for(let i = 0; i < handler.length; i++){
            if(handler[i] === fn){
                postion = i
            }else{
                postion = -1
            }
        }
        //如果找到匹配的函数，从数组中清除
        if(postion !== -1){
            //找到数组对应的位置，直接清除此回调
            handler.splice(postion,1)
            //如果清除后只有一个函数，那么取消数组，以函数形式保存
            if(handler.length === 1){
                this._events.set(type,handler[0])
            }
        }else{
            return this
        }
    }
}