import EBS from "../src/index.js";//引入文件
const db1 = new EBS('morez1',{
    name:{
        type:[String,Object],
        method:"L",
        default:'mod2',
        expireTime:60*200
    },
    age:{
        type:Number,
        default:12331,
        method:'L',
        once:true,
    },
    heigh:{}
},"qwerasdfzxcvrEqw")
const db2 = new EBS('morez2',{
    name:{
        type:[String,Object],
        method:"L",
        default:'mod2',
        expireTime:60*200
    },
    age:{
        type:Number,
        default:12331,
        method:'L',
        once:true,
    },
    heigh:{}
},"qwerasdfzxcvrEqw")
// db1.$data.name="enmotion2"
// db1.$data.age=111
// db1.$data.heigh=[]
// db2.clearProp('heigh')
console.log(db1.$data.name,1)
console.log(db1.$data.age,2)
console.log(db1.$data.age,3)
// console.log(db2)
// db1.clear("ALL")
console.log(localStorage);
console.log(sessionStorage)