import MS from "../src"
var assert = require ('assert');

describe('Easy-browser-store 测试',function(){    
    describe("创建实例 new",function(){
        it("如果入参 缺失,返回对象$namespace=undefined",function(){            
            var db1 = new MS()
            assert.equal(db1.$namespace,undefined)
        })
        it("如果入参 为空,返回对象$namespace=undefined",function(){
            var db2 = new MS({})
            assert.equal(db2.$namespace,undefined)
        })
        it("如果入参命名空间 为空,返回对象$namespace=undefined",function(){
            var db3 = new MS({
                props:{
                    name:{},   
                    sex:{}
                },
                key:"AEWRtyks!@#$1234"
            })
            assert.equal(db3.$namespace,undefined)
        })
        it("如果入参命属性对象 缺失,返回对象$namespace=undefined",function(){
            var db4 = new MS({
                namespace:"morez",
                key:"AEWRtyks!@#$1234"
            })
            assert.equal(db4.$namespace,undefined)
        })
        it("如果入参命属性对象 缺失,返回对象$namespace=undefined",function(){
            var db5 = new MS({
                namespace:"morez",
                props:{},
            })
            assert.equal(db5.$namespace,undefined)
        })
        it("入参正确,返回命名空间对象 ",function(){
            var db6 = new MS({
                namespace:"morez",
                props:{
                    name:{}
                },
            })
            assert.equal(db6.$namespace,"MS:MOREZ")
        })
        it("命名空间重复，返回对象$namespace=undefined ",function(){
            var db6 = new MS({
                namespace:"morez",
                props:{
                    age:{}
                },
            })
            assert.equal(db6.$namespace,undefined)
        })
        it("命名空间不重复，返回命名空间对象 ",function(){
            var db6 = new MS({
                namespace:"morez2",
                props:{
                    age:{}
                },
            })
            assert.equal(db6.$namespace,"MS:MOREZ2")
        })
    })
    var db1 = new MS({
        namespace:"morez-unCrypto",
        props:{
            name:{
                type:[String,Number],
                default:"mod",
                expireTime:1,
                method:"L"
            },
            hoppy:{
                type:[Object,Array],
                default:[],
                once:true,
            }
        },
        key:"!@#$QWERasdfREe!"
    })    
    describe("设置props",function(){
        it("props.name 读取属性默认值",function(){
            db1.clearProp("name")
            var value = db1.$data.name
            assert.equal(value,"mod")
        })
        it("props.name 写入属性值",function(){
            db1.$data.name ="enmotion"
            var value = db1.$data.name
            assert.equal(value,"enmotion")
        })        
        it("props.hoppy 写入属性值 类型错误，写入无效 返回默认值",function(){
            db1.$data.hoppy ="enmotion"
            var value = db1.$data.hoppy
            assert.equal(JSON.stringify(value),"[]")
        })
        it("props.hoppy 写入属性值 类型正确时，返回正确值",function(){
            db1.$data.hoppy =["enmotion"]
            var value = db1.$data.hoppy
            assert.deepEqual(value,["enmotion"])
        })
        it("props.hoppy 重复获取ONCE属性值，返回默认值",function(){
            // db1.$data.hoppy =["enmotion"]
            var value = db1.$data.hoppy
            assert.deepEqual(value,[])
        })
        it("props.hoppy 异步操作，返回正确值",function(done){
            db1.$data.name ="enmotion"
            //mocha 默认超时为2000，可以在mocha.js中修改这个时间，目前时间为80000
            setTimeout(function(){
                runDelay(done,function(){
                    var value = db1.$data.name
                    assert.deepEqual(value,"mod")
                })               
            },1000)            
        })
            
    })
    var db2 = new MS({
        namespace:"morez-crypto",
        props:{
            name:{
                type:[String,Number],
                default:"mod",
                expireTime:3,
                method:"L"
            }
        },
        key:"!@#$QWERasdfREw!"
    })
    describe("测试clearProp",function(){
        it("props.name 读取属性默认值",function(){
            db1.$data.name="try new name"
            var value = db1.$data.name
            var clearedValue = db2.clearProp("name")
            assert.deepEqual([value,clearedValue],["try new name","mod"])
        })
    })
})

function runDelay(done, f ) {
    try {
        f();
        done();
    } catch(e) {
        done(e);
    }
}