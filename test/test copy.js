import EBS from "../src/index.js";//引入文件
// const db1 = new EBS('morez1',"1BcDe%HUTTyhjoLp")
const db2 = new EBS('morez',{
    name:{
        type:[String,Object],
        method:"L",
        default:'mod2',
        expireTime:1000
    },
    age:{
        type:Number,
        default:22,
        method:'L'
    }
})
// db1.addProps({
//     name:{
//         type:[String,Object],
//         method:"L",
//         default:{},
//         expireTime:1000
//     },
//     age:{
//         type:Number,
//         default:11,
//         method:'S'
//     }
// })
// db1.addProps({
//     heigh:{
//         type:[String,Object],
//         method:"L",
//         default:'G1'
//         // expireTime:1
//     },   
// })
// db2.addProps({
//     name:{
//         type:[String,Object],
//         method:"L",
//         default:'mod2',
//         expireTime:1000
//     },
//     age:{
//         type:Number,
//         default:22,
//         method:'L'
//     }
// })
// db2.addProps({
//     heigh:{
//         type:[String,Object],
//         method:"L",
//         default:'G3'
//         // expireTime:1
//     },   
// })
// console.log(db1.$data.name,1)
// console.log(db2.$data.name,2)
// db1.$data.age=40
// db2.removeProp('name')
// db2.addProps({
//     name:{
//         type:[String,Object],
//         method:"S",
//         default:'mod23',
//         expireTime:1000
//     },
// })
// db1.$data.name='enmotion'
// db2.$data.name="enmotion2"
db2.$data.age=12
console.log(db2.$data.name,1)
console.log(db2.$data.age,2)
// console.log(db2)
// db1.clear("EBS")
console.log(localStorage);
console.log(sessionStorage)