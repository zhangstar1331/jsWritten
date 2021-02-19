//每隔一段时间执行一次
function throttle(fn,delay){
    let last = 0
    return (...args) => {
        const now = + Date.now()
        if(now>=last + delay){
            fn.apply(this,args)
            last = now
        }
    }
}