var json = '{"name":"star","age":"28"}'
//讨巧写法，谨防XSS攻击
var obj = eval("(" + json + ")")

//详细写法
/*
原理
当你在扫描文本流的过程中遇到一个左花括号（{）时，你知道你需要从当前字符开始，解析出一个对象，而解析对象的过程则是解析出多对 key/value，每解析完一对，如果你遇到了右花括号（}），则对这个对象的解析就结束了，而如果遇到的不是右花括号，则你需要解析下一对 key/value，直到遇见右花括号。而解析出一对 key/value，则是必须先解析出一个字符串，然后一个冒号（:），然后是这个 key 对应的值。

同理，当你遇到一个左方括号（[）时，你需要从这个字符开始解析出一个数组；而解析数组，则是解析出多个由逗号分隔的值，直到解析完一个值后遇到的不是逗号而是右方括号（]），则这个数组解析完毕。

而当你遇到一个双引号（"）时，则需要从当前位置开始解析出一个字符串。

遇到字母 “n” 的话，则是从当前位置开始往后读 4 个字符，且读到的 4 个字符组成的字符串必须是“null”，否则就应该报错。

遇到字母 “t” 的话，则是从当前位置开始往后读 4 个字符，且读到的 4 个字符组成的字符串必须是“true”，否则就应该报错。

遇到字母 “n” 的话，则是从当前位置开始往后读 5 个字符，且读到的 5 个字符组成的字符串必须是“false”，否则就应该报错。

剩下的就是数值了。
*/
var jsonStr = '{"a":1,"b":true,"c":false,"foo":null,"bar":[1,2,3]}'
console.log(parse(jsonStr))
function parse(json) {
    var i = 0
    var str = json
    function parseValue() {
        if (str[i] === '{') {
            return parseObject()
        } else if (str[i] === '[') {
            return parseArray()
        } else if (str[i] === 'n') {
            return parseNull()
        } else if (str[i] === 't') {
            return parseTrue()
        } else if (str[i] === 'f') {
            return parseFalse()
        } else if (str[i] === '"') {
            return parseString()
        } else {//如果不考虑出错的话，不是以上所有的情况即
            return parseNumber()
        }
    }

    // 所有的函数都是从i位置开始解析出一个对应类型的值
    // 同时把i移动到解析完成后的下一个位置
    function parseString() {
        var result = ''
        i++// 开始解析之前，i是指向字符开始的双引号的，但字符的内容是不包含这个双引号的
        while (str[i] != '"') {
            result += str[i++]
        }
        i++// 移动i到解析完成后的下一个位置
        return result
    }

    function parseNull() {
        // 简单粗暴，直接往后读出一个长度为4的个字符串出来
        // 如果不是null，则直接报错
        var content = str.substr(i, 4)

        if (content === 'null') {
            i += 4
            return null
        } else {
            throw new Error('Unexpected char at pos: ' + i)
        }
    }

    function parseFalse() {
        // 基本同上
        var content = str.substr(i, 5)

        if (content === 'false') {
            i += 5
            return false
        } else {
            throw new Error('Unexpected char at pos: ' + i)
        }
    }

    function parseTrue() {
        // 基本同上
        var content = str.substr(i, 4)

        if (content === 'true') {
            i += 4
            return true
        } else {
            throw new Error('Unexpected char at pos: ' + i)
        }
    }

    function parseNumber() {
        // 本函数的实现并没有考虑内容格式的问题，实际上JSON中的数值需要满足一个格式
        // 不过好在这个格式基本可以用正则表达出来，不过这里就不写了
        // 想写的话对着官网的铁路图写一个出来就行了
        // 并且由于最后调用了parseFloat，所以如果格式不对，还是会报错的
        var numStr = ''//-2e+8
        // 此处只要判断i位置还是数字字符，就继续读
        // 为了方便，写了另一个helper函数
        while (isNumberChar(str[i])) {
            numStr += str[i++]
        }
        return parseFloat(numStr)
    }

    // 判断字符c是否为组成JSON中数值的符号
    function isNumberChar(c) {
        var chars = {
            '-': true,
            '+': true,
            'e': true,
            'E': true,
            '.': true
        }
        if (chars[c]) {
            return true
        }
        if (c >= '0' && c <= '9') {
            return true
        }
        return false
    }

    // 解析数组，就很容易了
    // 掐头去尾
    // 然后一个值一个逗号
    // 如果解析完一个值后没遇到逗号，说明解析完了
    // 现在你知道没有多余的逗号有多好解析了吧~
    function parseArray() {
        i++
        var result = []//[1234,"lsdf",true,false]
        while (str[i] !== ']') {
            result.push(parseValue())
            if (str[i] === ',') {
                i++
            }
        }
        i++
        return result
    }

    // 解析对象，一如既往的简单
    // 掐头去尾
    // 然后一个key，是字符串
    // 一个冒号
    // 一个值，可能是任意类型，所以调用parseValue
    // 最后，如果解析完一组k/v对，遇到了逗号，则解析下一组，没遇到逗号，则解析完毕
    function parseObject() {
        i++
        var result = {}//{"a":1,"b":2}
        while (str[i] !== '}') {
            var key = parseString()
            i++//由于只考虑合法且无多余空白的JSON，所以这里就不判断是不是逗号了，正常应该是发现不是逗号就报错的
            var value = parseValue()
            result[key] = value
            if (str[i] === ',') {
                i++
            }
        }
        i++
        return result
    }
    return parseValue()
}

