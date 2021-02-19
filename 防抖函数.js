//只执行最后一次
function debounce(fn,delay){
    let timer = null;
    return (...args) => {
        if(timer) clearTimeout(timer)
        timer = setTimeout(()=>{
            fn.apply(this,args)
        },delay)
    }
}