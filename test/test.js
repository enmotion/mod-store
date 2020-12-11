// var assert = require('assert');
// var EBS = require('@/src/index.js')
import EBS from "../src/index.js";//引入文件

// describe('Array', function() {
//   describe('#indexOf()', function() {    
//     it('should return -1 when the value is not present', function() {
//         assert.equal([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });

// 
const db1 = new EBS('morez2',{
    name:{
        type:[String,Object],
        method:"L",
        default:'mod2',
        expireTime:60*60
    },
    age:{
        type:Number,
        default:12331,
        method:'L',
        once:true,
    },
    heigh:{}
},"qwerasdfzxcvrEqw")
// const db2 = new EBS('morez2',{
//     name:{
//         type:[String,Object],
//         method:"L",
//         default:'mod2',
//         expireTime:60*200
//     },
//     age:{
//         type:Number,
//         default:12331,
//         method:'L',
//     },
//     heigh:{}
// },"qwerasdfzxcvrEqw")
db1.$data.name="enmotion2"
db1.$data.age=111
// db1.$data.heigh=[]
// db2.clearProp('heigh')
console.log(db1.$data.name,1)
console.log(db1.$data.age,2)
console.log(db1.$data.age,3)
// console.log(db2)
// db1.clear("ALL")
console.log(localStorage);
console.log(sessionStorage)

// describe('add', function () {
//     it('6 + 7 = 13', function () {
//         (function(){return 13})().should.equal(13)
//     })

//     it('9 + 10 = 19', function () {
//         add(9 , 10).should.equal(19)
//     }) 
// })