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

范例

```
import EBS from "easy-browser-store"

let BS=new EBS("appName",key);//如果创建实例时，有KEY值，则会采用加密模式,

BS.addItems({
    name:{
        type:String,
        defalut:"", //默认值为 null 修正为 "",
        method:localStorage, //默认为sessionStorage
    },
    age:{
        type:[String,Number],
        defalut:0, //默认值为 null 修正为 0
    },
})
BS.setItem("name",123);
//报错，类型不符合

BS.setItem("name","123");//保存成功
BS.getItem("")

```

### API 类方法 ###
#### createStroage(appName,version)<br> #### 
用于MBS的实例创建，重复创建会返回之前已创建的实例，避免重复创建。为避免数据在同域但不同应用中的污染问题(如前端版本升级)，需在进行正式操作数据前，创建一个命名空间，而输入的 appName,version 则会依照规则注册成一个命名空间，并为其准备相应的【数据模型】空间。<br>
同一个应用内也可以创建不同的命名空间，可方便多人对缓存数据操作的需要！<br>


```
import MBS from "mod-browser-storage"

let BS=new MBS.createStorage("appName","version");//=>返回实例
//appName 必填 字符
//version 选填
```
####  clearStorage([config]) #### 
清除实例命名空间;<br>
ignoreNameSpace:需要忽视的【数据模型】的命名空间名，在本次清除操作此属性包含的命名空间，将会清理忽视。<br>
isSelfishMode:Boolean 默认为true,自私模式开启后，只会对依照BS创建规则创建缓存数据进行处理，其他应用所创建的缓存数据则不会擦除。<br>
<br>
清理操作分作两步<br>
1.清理命名空间里，对应的【数据模型】;<br>
2.清理sessionStorage,localStorage 对应存储的数值;<br>

```
import MBS from "mod-browser-storage"

MBS.clearStorage({
    ignoreNameSpace:[
        {domain:"domainName",version:"10.0"},
        "domainName/10.0"
    ],//忽略的命名空间,支持对象与字符的双重模式
    isSelfishMode:false,//自私模式
});//=>返回实例
//appName 必填 字符
//version 选填
```

### API 实例方法 ###

#### 数据表操作 ####
#### addItems(schemes) ####

MBS实例后，需要在命名空间内创建【数据模型】schemes 才能正常进行属性的读写操作，先声明再使用的方式，避免了数据在使用时，类型与名称随意设置带来的混乱;
```
BS.addItems({
    name:{
        type:String,//数据类型约束描述 支持函数或数组入参[String,Number]
        defalut:"someone",//该数值的默认值，取值失败时，返回默认值, 缺省时：默认值为null
        method:"L"//存储方式"L":localStorage,"S":sessionStorage,默认值为"L"
    },
    age:{
        type:[String,Number],
        defalut:0
    },
    ....
})
```
#### removeItem(key) #### 
在实例的命名空间【数据模型】中，删除相应的数据模型描述，删除后，该数据键名将不再可进行写入操作; 如需要再次使用，则需要重新进行 addItems操作
```
BS.removeItem("name");//如注册表中为包含此属性，则会提示警告 
```


#### 数值存储操作 ####

#### setItem(key,value,expireTime) #### 
写入数据操作 <br>
```
BS.setItem("name",12,Date.now()/1000+3600)

//key:String 键名 
//value: 存入的值类型不限制，无需任何字串化操作，存什么取什么
//expireTime: timestamp 过期时间，该数据存入时，可设置到期时间,非必填，不填则无过期时间
```

#### getItem(key,config) #### 
取值操作 <br>
```
BS.getItem("name",{once:false,freshness:1000});

//key:String 对应的取值键名
//config:{
//    once:Boolean,//是否取值后销毁，取值后销毁的只是存储的数据  默认:false
//    freshness:Number,//新鲜度，该数据最后更新时间与当前相差不得超过多少秒 非必填，不填则不会判定新鲜度
//}

```
注意：freshness 与写入时的 expireTime 都为控制数据的时效性; 区别是，写入时的expireTime 一旦到期，则该数据再不可被读取出来，且读取时发现过期，会直接清理掉该数据; 而freshness则只是在读取时，根据读取规则进行读取操作判定，过期也不会擦除缓存内的数据。

#### clearItem(key) #### 
擦除数据，擦除数据与removeItem有所有不同，该方法，仅清除缓存内的数值，并不会清除【数据模型】内的数据结构
```
BS.clearItem("name")
```
