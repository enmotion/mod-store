import EBS from "../src"
var assert = require ('assert');
const db1 = new EBS({
    namespace:"morez",
    props:{
        name:{
            type:String,
            default:"mod",
        },
        age:{
            type:[String,Number]
        }
    }
})

describe('Easy-browser-store 测试',function(){
    describe("创建实例",function(){
        it("new with out namespace parameter,should return {}",function(){
            var db = new EBS({
                props:{
                    name:{},
                    sex:{}
                },
                key:"AEWRtyks!@#$1234"
            })
            assert.equal(JSON.stringify(db),"{}")
        })       
    })    
})