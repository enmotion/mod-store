import MB from "../src"

let db1=new MB({
    namespace:"myNameSpace",//给出命名空间，easyBrowserStore会依照规则自动命名空,命名空间不可重复，重复则创建失效;
    props:{//可以用于记录的属性，数据格式声明;
        name:{
            type:[String,Number],//默认：类型无约束，数据类型
            default:"myname",//默认：undefined，默认值，默认值必须与约束类型相符，否则会报错！
            expireTime:undefined,//默认：undefined 无过期时间，过期时间，过期时间到时，取值会返回默认值，而非存入值，单位秒！
           // once:true,//默认：false, 阅后即焚，该数据只读一次，读后自动销毁，下次读取则为默认值，直到新的存入！
            method:"L"//默认：S,存储方式 'S':sessionStorage，'L':localStorage, MB会根据浏览器环境检测相关方法，如果禁用了相关方法，则会用cookie替代
        },
        age:{
            type:Number,            
            //expireTime:2,//两秒后数据过期！
            method:"S",
        },
        hoppy:{
            type:Array,
            method:"S",
            default:["chat"]
        }
    },
    //key:"XEF!1234UiteM~!@" //加密密钥，仅支持 16 位英文字符，数字与符号，如配置不正确或者没有配置KEY，则会明文存储数据资料，非加密模式，加密后，资料内容会占用更多的存储空间，请注意！！！
});

// db1.$data.name = "enmotion";
// db1.$data.age = 12;
// db1.$data.hoppy = ["haha"]

console.log(db1.$data.name) // "myname"
console.log(db1.$data.age) // undefined
// db1.$data.name = false //报错，数据类型只允许 [String,Number]
// db1.$data.name = "new_name";
// console.log(db1.$data.name) // "new_name";
// console.log(db1.$data.name) // "myname" 阅后即焚，数值被清除，只返回 默认值 "myname"

// db1.$data.age = 12
// console.log(db1.$data.age) // 12
// setTimeout(function(){
//     console.log(db1.$data.age) // undefined 数据已经过期，返回默认值！
// },2001)
// console.log(db1.$data.age) // 12

// //清除数据
// db1.$data.hoppy = ["runing","singing"];
// console.log(db1.$data.hoppy) // ["runing","singing"]
// db1.clearProp("hoppy") //数据被清空
// console.log(db1.$data.hoppy) // ["chat"]
console.log(window.localStorage)
console.log(window.sessionStorage)
//清除命名空间
//清除命名空间
// db1.clearData("ALL");// "SELF",仅清自身，"MB"清理所有的easyBrowserStore存储的数据，"ALL",清除本地所有缓存