//Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的proto
function create(proto){
    function F(){}
    F.prototype = proto
    return new F()
}