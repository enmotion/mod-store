# easy-browser-store #

为在浏览器环境下，为操作持久化的缓存数据提供便捷。<br>

#### 功能概述：####
1.支持命名空间：避免数据数据污染，同域下访问不同应用之间对缓存数据的隔离方案不全，导致容易出现数据污染的情况;<br>
2.简便化操作：数据读写时，繁琐的 JSON.stringify(),JSON.parse()转换，导致易错且操作麻烦;通过Object.defineProperty,实现数据的快捷读写<br>
3.数据时效性：写入数据时更新数据写入时间，读出时比对数据props中的过期设置，可针对性解决数据时效问题，同时提供只读一次数据写入属性，读后即焚<br>
4.数据类型校验：为避免在实际操作时，数据类型的不准确性，导致应用崩溃，因此支持了数据的类型校验，发现数据类型错误时，则会报异常并终止读写操作<br>
5.缓存空间管理：可清除本地缓存数据，应用模式，EBS模式，全局模式三种模式可分别情理不同的缓存数据情况。<br>
6.数据加密：支持自定义16字符长度的字符串为密钥，对存入的数据进行加解密处理，避免敏感数据明文暴露。<br>
#### install ####
npm安装命令
```
npm install --save easy-browser-store
```

#### Usage ####

引入包
```
import EBS from "easy-browser-store"
```

USEAGE 使用方法 范例代码

```
import EBS from "easy-browser-store"

let db1=new EBS({
    namespace:"myNameSpace",//给出命名空间，easyBrowserStore会依照规则自动命名空,命名空间不可重复，重复则创建失效;
    props:{//可以用于记录的属性，数据格式声明;
        name:{
            type:[String,Number],//默认：类型无约束，数据类型
            default:"myname",//默认：undefined，默认值，默认值必须与约束类型相符，否则会报错！
            expireTime:undefined,//默认：undefined 无过期时间，过期时间，过期时间到时，取值会返回默认值，而非存入值，单位秒！
            once:true,//默认：false, 阅后即焚，该数据只读一次，读后自动销毁，下次读取则为默认值，直到新的存入！
            method:"S"//默认：S,存储方式 'S':sessionStorage，'L':localStorage, ebs会根据浏览器环境检测相关方法，如果禁用了相关方法，则会用cookie替代
        }，
        age:{
            type:Number,
            expireTime:2,//两秒后数据过期！
        },
        hoppy:{
            type:Array,
            defalut:["chat"]
        }
    },
    key:"XEF!1234UiteM~!@" //加密密钥，仅支持 16 位英文字符，数字与符号，如配置不正确或者没有配置KEY，则会明文存储数据资料，非加密模式，加密后，资料内容会占用更多的存储空间，请注意！！！
});

console.log(db1.$data.name) // "myname"
console.log(db1.$data.age) // undefined
db1.$data.name = false //报错，数据类型只允许 [String,Number]
db1.$data.name = "new_name";
console.log(db1.$data.name) // "new_name";
console.log(db1.$data.name) // "myname" 阅后即焚，数值被清除，只返回 默认值 "myname"

db1.$data.age = 12
console.log(db1.$data.age) // 12
setTimeout(function(){
    console.log(db1.$data.age) // undefined 数据已经过期，返回默认值！
},2001)
console.log(db1.$data.age) // 12

//清除数据
db1.$data.hoppy = ["runing","singing"];
console.log(db1.$data.hoppy) // ["runing","singing"]
db1.clearProp("hoppy") //数据被清空
console.log(db1.$data.hoppy) // ["chat"]

//清除命名空间
db1.clearData("SEFL");// "SELF",仅清自身，"EBS"清理所有的easyBrowserStore存储的数据，"ALL",清除本地所有缓存 
```

### API 类方法 ###
#### new EBS(config)<br> ####
namespace:命名空间
props:用户存储的值申明
key:密钥，16位英文字符，数字符号

```
import EBS from "easy-browser-store"
let db2=new EBS({
    namespace:"myname",
    props:{name:{},age:{}},
    key:"~1@3DAQEeEZeFik!",
});
```
####  clearProp(propName:String) #### 
清除属性的存储值
propName:属性名
清除后，该属性存储在缓存中的值将被抹除

####  clearData("SELF") #### 
清除缓存的值
"SELF":仅清理该命名空间下的值,
"EBS":清理所有EBS创建出来的缓存空间,
"ALL":清理所有的缓存空间， 慎用！！！！
