Function.prototype.apply = function(context, args){
    context = Object(context) || window
    context.fn = this
    const result = context.fn(...args)
    delete context.fn
    return result
}