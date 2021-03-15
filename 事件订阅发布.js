class Observer{
    constructor(){
        this.events = {} //保存监听事件
    }
    //订阅
    subscribe(eventName, handle){
        if(this.events[eventName]){
            this.events[eventName].push(handle)
        }else{
            this.events[eventName]=[handle]
        }
    }
    //发布
    publish(eventName, ...args){
        if(this.events[eventName]){
            this.events[eventName].forEach(cb=>cb.apply(this,args))
        }
    }
    //取消订阅
    unsubscribe(eventName, handle){
        if(this.events[eventName]){
            this.events[eventName] = this.events[eventName].filter(cb=>cb!==handle)
        }
    }
}

const ob = new Observer()
function show(){
    console.log(111111111)
}
ob.subscribe('showCon',show)
ob.subscribe('showCon',show)
ob.unsubscribe('showCon',show)
ob.publish('showCon')