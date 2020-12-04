"use strict";
const R = require('ramda');
//加密函数，依照情况进行加密
//引入cookie操作类
import {setCookie,getCookie,clearCookie} from "./cookieStorage";
// var AES = require('aes')

function EBS(namespace){
    const storeTypes = {'L':'localStorage','S':'sessionStorage'};
    const dataBase = {};
    const cache = {localStorage:{},sessionStorage:{},cookieStorage:{}};
    //检测环境是否携带locaoStorage方法，防止浏览器开启了无痕模式导致localStorage/sessionStorage不兼容的情况
    const storeMethods = {
        localStorage:window.localStorage,
        sessionStorage:window.sessionStorage,
        cookieStorage:{
            setItem:setCookie,
            getItem:getCookie,
            removeItem:clearCookie,
        }
    }
    // window.cookieStroage={setItem:setCookie,getItem:getCookie};
    const hasLocalStorage = withLocalStorage(window.localStorage);
    const hasSessionStorage = withLocalStorage(window.sessionStorage);
    function withLocalStorage(storage){
        try {
            storage.setItem('EBSTEST','EBSTEST');
            var str = storage.getItem('EBSTEST');
            storage.removeItem('EBSTEST');
            return str == 'EBSTEST' ? true : false
        }catch(error){
            return false
        }
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
                    // method: R.keys(storeTypes).indexOf(props[i].method)<0? storeTypes.S : storeTypes[props[i].method], //设置存储方式,如果入参错误就做session储存
                    method:function(m){
                        let method = R.keys(storeTypes).indexOf(m)<0? storeTypes.S : storeTypes[m];
                        if(method == 'localStorage' && hasLocalStorage){
                            return method
                        }
                        if(method == 'sessionStorage' && hasSessionStorage){
                            return method
                        }
                        return 'cookieStorage'
                    }(props[i].method),
                    once:props[i].once,
                    expireTime:props[i].expireTime,
                }
                //配置对象的观察模式
                Object.defineProperty(dataBase.$data,i,{
                    configurable:true,//因为设置了set 与 get 方法，因此需修正可配置选项为true,属性可以被删除
                    enumerable:true,//同上，属性可以被枚举
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
                            var dataStr = enCryptoData(cache[schemes[i].method])
                            // storeMethods[schemes[i].method].setItem(dataBase.$namespace,JSON.stringify(cache[schemes[i].method]))
                            storeMethods[schemes[i].method].setItem(dataBase.$namespace,dataStr)
                        }
                    },
                    get:function(){
                        let now = Math.round(Date.now() / 1000);
                        // let cacheData =JSON.parse(storeMethods[schemes[i].method].getItem(dataBase.$namespace))||{};
                        let cacheData = deCryptoData(storeMethods[schemes[i].method].getItem(dataBase.$namespace))||{};
                        if(cacheData.constructor == Object && cacheData[i] && (schemes[i].expireTime == null || now < schemes[i].expireTime + cacheData[i].ut)){
                            var data = cacheData[i];
                            if(schemes[i].once){
                               delete cache[schemes[i].method][i];
                               storeMethods[schemes[i].method].setItem(dataBase.$namespace,JSON.stringify(cache[schemes[i].method]));
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
    function enCryptoData(data){
        var str = JSON.stringify(data)
        str = dataBase.beforeSet(str)
        if(str.constructor == String){
            return str
        }else{
            console.log('ERROR:')
        }
    }
    function deCryptoData(str){
        str = dataBase.beforeGet(str)
        // if(key != ''){
            return JSON.parse(str)
        // }else{
            // return JSON.parse(str)
        // }
    }
    //移出属性 移除时会清除在$data里的数据结构
    function removeProp(prop){
        delete dataBase.$data[prop];
        clearProp(prop);
    }
    //清除属性 清除时，仅仅删除在储值空间里的值 
    function clearProp(prop){
        delete cache.localStorage[prop];
        storeMethods.localStorage.setItem(dataBase.$namespace,JSON.stringify(cache.localStorage));
        delete cache.sessionStorage[prop];
        storeMethods.sessionStorage.setItem(dataBase.$namespace,JSON.stringify(cache.sessionStorage));
        delete cache.cookieStorage[prop];
        storeMethods.cookieStorage.setItem(dataBase.$namespace,JSON.stringify(cache.cookieStorage));
    }
    //清除整个缓存
    function clear(type){
        var type = type || 'SELF';
        let clearType = ['SELF','EBS','ALL'];        
        type = clearType.indexOf(type.toUpperCase())<0?clearType[0]:type;
        dataBase.$data={};
        cache.localStorage = {};
        cache.sessionStorage = {};
        switch(type){
            case 'SELF':                             
                storeMethods.localStorage.removeItem(dataBase.$namespace)
                storeMethods.sessionStorage.removeItem(dataBase.$namespace)
                storeMethods.cookieStorage.removeItem(dataBase.$namespace)
            break;
            case 'EBS':                  
                for(var i in storeMethods.localStorage){
                    if(i.split(':')[0] == 'EBS'){
                        storeMethods.localStorage.removeItem(i)
                    }
                }
                for(var i in storeMethods.sessionStorage){
                    if(i.split(':')[0] == 'EBS'){
                        storeMethods.sessionStorage.removeItem(i)
                    }
                }
                //cookie的遍历方式比较特殊，需要先通过无参方式获取全部的cookie对象，方可进行清除
                for(var i in storeMethods.cookieStorage.getItem()){
                    if(i.split(':')[0] == 'EBS'){
                        storeMethods.cookieStorage.removeItem(i)
                    }
                }
            break;
            case 'ALL':
                storeMethods.localStorage.clear();
                storeMethods.sessionStorage.clear();
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
         * $namespace 【不可写，不可配置，不可枚举】 并在创建时依照规则赋值命名
         * $data 【可写，不可配置，不可枚举】
         * addProps 【 不可写，不可配置，不可枚举】添加属性
         * removeProp 【 不可写，不可配置，不可枚举】移除属性
         * clear 【不可写，不可配置，不可枚举】清除所有属性，'SELF','EBS','ALL'
        */
        Object.defineProperties(dataBase,{
            $namespace:{writable:false,configurable:false,enumerable:false,value:'EBS:'+namespace.toUpperCase()+"#"},
            $data:{writable:true,configurable:false,enumerable:false,value:{}},
            addProps:{writable:false,configurable:false,enumerable:false,value:addProps},           
            removeProp:{writable:false,configurable:false,enumerable:false,value:removeProp},
            clearProp:{writable:false,configurable:false,enumerable:false,value:clearProp},
            clear:{writable:false,configurable:false,enumerable:false,value:clear},
            beforeSet:{writable:true,configurable:false,enumerable:false,value:function(str){return str}},
            beforeGet:{writable:true,configurable:false,enumerable:false,value:function(str){return str}}
        })
        return dataBase
    }   
}
export default EBS