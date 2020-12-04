import EBS from "../lib/index.js";//引入文件
const db1 = new EBS('morez1')
const db2 = new EBS('morez2')
// set cookie
function setCookie(key, val, seconds) {
    let exp = null;
    let expires = "";
    if (seconds) {
        exp = new Date();
        exp = new Date(exp.setTime(exp.getTime() + seconds * 1000)).toUTCString();
        expires = ";expires=" + exp;
    }
    let str = JSON.stringify([val])
    document.cookie = key + "=" + escape(str) + expires;
}

// get cookie
function getCookie(name) {
    let cookie = document.cookie
    cookie = cookie.split(';').map(function (value) {
        return value.trim()
    }).reduce(function (obj, item) {
        let index = item.indexOf('=');
        obj[item.slice(0, index)] = item.slice(index + 1);
        return obj
    }, {});    
    if (name){
        if(cookie[name]){
            return JSON.parse(unescape(cookie[name]))[0] || '';
        }else{
            return cookie[name]
        }        
    } 
    for(var i in cookie){
        try{
            cookie[i]=JSON.parse(unescape(cookie[i]))
            cookie[i] = cookie[i].constructor == Array ? cookie[i][0] : cookie[i]
        }catch{
            
        }        
    }
    return cookie || ''
}
// setCookie('name',{name:123},2)
console.log(getCookie('name'),1232333)
db1.addProps({
    name:{
        type:[String,Object],
        method:"L",
        default:'mod1',
        expireTime:1000
    },
    age:{
        type:Number,
        default:11,
        method:'S'
    }
})
db1.addProps({
    heigh:{
        type:[String,Object],
        method:"L",
        default:'G1'
        // expireTime:1
    },   
})
db2.addProps({
    name:{
        type:[String,Object],
        method:"L",
        default:'mod2',
        expireTime:1000
    },
    age:{
        type:Number,
        default:22,
        method:'S'
    }
})
db2.addProps({
    heigh:{
        type:[String,Object],
        method:"L",
        default:'G3'
        // expireTime:1
    },   
})
// db1.$data.name="enmotion1"
// db2.$data.name="enmotion2"
console.log(db1.$data.name,1)
console.log(db2.$data.name,2)
// db1.$data.age=40
// db2.removeProp('name')
db2.addProps({
    name:{
        type:[String,Object],
        method:"L",
        default:'mod3',
        expireTime:1000
    },
})

console.log(db1.$data.name,1)
console.log(db2.$data.name,2)
console.log(db2)
db1.clear("ALL")
console.log(localStorage);
console.log(sessionStorage)