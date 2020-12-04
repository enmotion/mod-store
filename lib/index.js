"use strict";
const R = require('ramda');

function EBS(namespace){
    const storeTypes = {'L':'localStorage','S':'sessionStorage'};
    const dataBase = {};
    const cache = {localStorage:{},sessionStorage:{}}
    window.cookie  
    //检测环境是否携带locaoStorage方法，防止浏览器开启了无痕模式导致localStorage不兼容的情况
    function hasLocalStorage(){

    }
    function addProps(props){
        if (!props.constructor == Object) { //必须为object对象
            console.error("ERROR: STORAGE [" + dataBase.namespace + "] addPropsToSchemes method paramater must be an instanc of Object") //如果数据模型格式非对象，则直接报错
        } else {
            //默认值类型校对,默认值如果类型不正确会返回错误        
            for(let b in props){
                if(props[b].default && props[b].type){
                    var defaultValue = props[b].default.constructor == Function ? props[b].default():props[b].default
                    let types = props[b].type.constructor == Function ? [props[b].type] : props[b].type;
                    if(types.indexOf(defaultValue.constructor)<0){
                        console.error("ERROR:invalid value,props Key:"+b+" type check failed,Expected "+R.pluck("name")(types)+", got "+defaultValue.constructor.name);
                        return;
                    }
                }                
            }
            let schemes = {};
            for(let i in props){
                schemes[i]={
                    type: props[i].type,//元素类型
                    default:props[i].default,//元素返回的默认值，默认情况下为null
                    method: R.keys(storeTypes).indexOf(props[i].method)<0? storeTypes.S : storeTypes[props[i].method], //设置存储方式,如果入参错误就做session储存
                    once:props[i].once,
                    expireTime:props[i].expireTime,
                }
                //配置对象的观察模式
                Object.defineProperty(dataBase.$data,i,{
                    configurable:true,//因为设置了set 与 get 方法，因此需修正可配置选项为true
                    enumerable:true,//同上
                    set:function(value){
                        let types = schemes[i].type.constructor == Function ? [schemes[i].type] : schemes[i].type;
                        if(types.indexOf(value.constructor)<0){
                            console.error("ERROR:STORAGE [" + dataBase.$namespace + "] $data."+i+" invalid value,type check failed,Expected " +R.pluck("name")(types)+", got "+value.constructor.name)
                        }else{
                            cache[schemes[i].method][i] = {
                                value: value,
                                type: value.constructor.name,
                                ut: Math.round(Date.now() / 1000) //刷新更新时间
                            }
                            window[schemes[i].method].setItem(dataBase.$namespace,JSON.stringify(cache[schemes[i].method]))
                        }
                    },
                    get:function(){
                        let now = Math.round(Date.now() / 1000);
                        let cacheData =JSON.parse(window[schemes[i].method].getItem(dataBase.$namespace))||{};
                        if(cacheData.constructor == Object && cacheData[i] && (schemes[i].expireTime == null || now < schemes[i].expireTime + cacheData[i].ut)){
                            var data = cacheData[i];
                            if(schemes[i].once){
                               delete cache[schemes[i].method][i];
                               window[schemes[i].method].setItem(dataBase.$namespace,JSON.stringify(cache[schemes[i].method]));
                            }
                            return data.value
                        }else{
                            return schemes[i].default && schemes[i].default.constructor == Function ? schemes[i].default(): schemes[i].default
                        }                   
                    }
                })
            }
        }
    }
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
    function removeProp(prop){
        delete dataBase.$data[prop]
        delete cache.localStorage[prop];
        window.localStorage.setItem(dataBase.$namespace,JSON.stringify(cache.localStorage));
        delete cache.sessionStorage[prop];
        window.sessionStorage.setItem(dataBase.$namespace,JSON.stringify(cache.sessionStorage));
    }
    function clear(type){
        var type = type || 'SELF';
        type = type.toUpperCase();
        let clearType = ['SELF','EBS','ALL'];        
        type = clearType.indexOf(type.toUpperCase())<0?clearType[0]:type;
        dataBase.$data={};
        cache.localStorage = {};
        cache.sessionStorage = {};
        switch(type){
            case 'SELF':                             
                window.localStorage.removeItem(dataBase.$namespace)
                window.sessionStorage.removeItem(dataBase.$namespace)
            break;
            case 'EBS':                  
                for(var i in window.localStorage){
                    if(i.split(':')[0] == 'EBS'){
                        window.localStorage.removeItem(i)
                    }
                }
                for(var i in window.sessionStorage){
                    if(i.split(':')[0] == 'EBS'){
                        window.sessionStorage.removeItem(i)
                    }
                }
            break;
            case 'ALL':
                window.localStorage.clear();
                window.sessionStorage.clear();
            break;
        }
    }    
    //校验namespace参数不能为空或者非字符类型
    if(R.isNil(namespace) || R.isEmpty(namespace) || namespace.constructor != String){
        console.error("ERROR: EasyBrowserStrore Constructor parameter [namespace] cannot be empty and must be a String");
        return {}
    }else{
        /*
         * 定义dataBase的属性
         * namespace 【不可写，不可配置，不可枚举】 并在创建时依照规则赋值命名
         * data 【可写，不可配置，不可枚举】
         * schemes 【 可写，不可配置，不可枚举】
        */
        Object.defineProperties(dataBase,{
            $namespace:{
                writable:false,
                configurable:false,
                enumerable:false,
                value:'EBS:'+namespace.toUpperCase()+"#"
            },
            $data:{
                writable:true,
                configurable:false,
                enumerable:false,
                value:{}
            },
            addProps:{
                writable:false,
                configurable:false,
                enumerable:false,
                value:addProps
            },           
            removeProp:{
                writable:false,
                configurable:false,
                enumerable:false,
                value:removeProp
            },
            clear:{
                writable:false,
                configurable:false,
                enumerable:false,
                value:clear
            }
        })
        return dataBase
    }   
}
export default EBS