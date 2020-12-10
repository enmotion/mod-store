"use strict";
const R = require('ramda');
import cookiStore from "./libs/cookie";
import Crypto from "./libs/crypto"

let nameSpacePool={};

function EBS(namespace,props,key){    
    const storeTypes = {'L':'localStorage','S':'sessionStorage'};
    const dataBase = {};
    const schemes = {};
    const cache = {localStorage:{},sessionStorage:{},cookieStorage:{}};
    //创建aes加密器，该创建方式会根据密钥自动处理成加密方式
    let aesCrypto = new Crypto(key);
    //检测运行环境,是否支持 localStorage,sessionStorage如果不支持则直接更换成cookie方式 解决兼容问题
    const storeEngine= {
        localStorage:hasApi(window.localStorage)?window.localStorage:cookiStore,
        sessionStorage:hasApi(window.sessionStorage)?window.sessionStorage:cookiStore,
        cookieStorage:cookiStore
    }
    // 检测本地存储方法是否可行,如果存在不能使用的方法，则会启用cookie存储模式替代
    function hasApi(storage){
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
            console.error("ERROR: STORAGE [" + dataBase.$namespace + "] addPropsToSchemes method paramater must be an instanc of Object") //如果数据模型格式非对象，则直接报错
        } else {
            //默认值类型校对,默认值如果类型不正确会返回错误        
            for(let b in props){
                if(props[b].default && props[b].type){
                    var defaultValue = props[b].default.constructor == Function ? props[b].default():props[b].default
                    let types = props[b].type.constructor == Function ? [props[b].type] : props[b].type;
                    if(types.indexOf(defaultValue.constructor)<0){
                        console.error("ERROR:invalid default value,props:"+b+",Expected "+R.pluck("name")(types)+", got "+defaultValue.constructor.name);
                        return;
                    }
                }                
            }
            for(let i in props){
                schemes[i]={
                    type: props[i].type,//元素类型
                    default:props[i].default,//元素返回的默认值，默认情况下为null
                    // method: R.keys(storeTypes).indexOf(props[i].method)<0? storeTypes.S : storeTypes[props[i].method], //设置存储方式,如果入参错误就做session储存
                    method:function(m){
                        return R.keys(storeTypes).indexOf(m)<0? storeTypes.S : storeTypes[m];
                    }(props[i].method),
                    once:props[i].once,
                    expireTime:props[i].expireTime,
                }
                //配置对象的观察模式
                Object.defineProperty(dataBase.$data,i,{
                    configurable:true,//因为设置了set 与 get 方法，因此需修正可配置选项为true,属性可以被删除
                    enumerable:true,//同上，属性可以被枚举
                    set:function(value){
                        let types = schemes[i].type && schemes[i].type.constructor == Function ? [schemes[i].type] : schemes[i].type;
                        if(types && types.indexOf(value.constructor)<0){
                            console.error("ERROR:STORAGE [" + dataBase.$namespace + "] $data."+i+" invalid value,type check failed,Expected [" +R.pluck("name")(types)+"], got "+value.constructor.name)
                        }else{
                            let cacheData = cache[schemes[i].method];
                            cacheData[i] = {
                                value: value,
                                type: value.constructor.name,
                                ut: Math.round(Date.now() / 1000) //刷新更新时间
                            }
                            setCache(schemes[i].method,cacheData)
                        }
                    },
                    get:function(){
                        let now = Math.round(Date.now() / 1000);
                        let cacheData = cache[schemes[i].method];
                        if(cacheData.constructor == Object && cacheData[i] && (schemes[i].expireTime == null || now < schemes[i].expireTime + cacheData[i].ut)){
                            var data = cacheData[i];
                            if(schemes[i].once){
                               delete cache[schemes[i].method][i];
                               setCache(schemes[i].method, cache[schemes[i].method]);
                            }
                            let types = schemes[i].type && schemes[i].type.constructor == Function ? [schemes[i].type] : schemes[i].type;
                            //如果值类型不对，则返回默认值，否则返回正确值
                            if(types && types.indexOf(data.value.constructor)>-1){
                                return data.value
                            }else{
                                return schemes[i].default && schemes[i].default.constructor == Function ? schemes[i].default(): schemes[i].default
                            }                           
                        }else{
                            return schemes[i].default && schemes[i].default.constructor == Function ? schemes[i].default(): schemes[i].default
                        }                   
                    }
                })
            }
            Object.preventExtensions(dataBase.$data)
        }
    }
    //读取缓存
    function getCache(engineNameStr){
        return aesCrypto.deCryptoData(storeEngine[engineNameStr].getItem(dataBase.$namespace));
    }
    //写入缓存
    function setCache(engineNameStr,data){
        storeEngine[engineNameStr].setItem(dataBase.$namespace,aesCrypto.enCryptoData(data));
    }
    //清除属性 清除时，仅仅删除在储值空间里的值 
    function clearProp(prop){
        delete cache.localStorage[prop];
        setCache('localStorage',cache.localStorage);
        delete cache.sessionStorage[prop];
        setCache('sessionStorage',cache.sessionStorage)
        delete cache.cookieStorage[prop];
        setCache('cookieStorage',cache.cookieStorage)
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
                storeEngine.localStorage.removeItem(dataBase.$namespace)
                storeEngine.sessionStorage.removeItem(dataBase.$namespace)
                storeEngine.cookieStorage.removeItem(dataBase.$namespace)
            break;
            case 'EBS':                  
                for(var i in storeEngine.localStorage){
                    if(i.split(':')[0] == 'EBS'){
                        storeEngine.localStorage.removeItem(i)
                    }
                }
                for(var i in storeEngine.sessionStorage){
                    if(i.split(':')[0] == 'EBS'){
                        storeEngine.sessionStorage.removeItem(i)
                    }
                }
                //cookie的遍历方式比较特殊，需要先通过无参方式获取全部的cookie对象，方可进行清除
                for(var i in storeEngine.cookieStorage.getItem()){
                    if(i.split(':')[0] == 'EBS'){
                        storeEngine.cookieStorage.removeItem(i)
                    }
                }
            break;
            case 'ALL':
                storeEngine.localStorage.clear();
                storeEngine.sessionStorage.clear();
                for(var i in storeEngine.cookieStorage.getItem()){
                    storeEngine.cookieStorage.removeItem(i)
                }
            break;
        }
    } 
    //校验namespace参数不能为空或者非字符类型,命名空间实例不能已经存在   
    if(R.isNil(namespace) || R.isEmpty(namespace) || namespace.constructor != String || R.keys(nameSpacePool).indexOf("EBS:"+namespace.toUpperCase())>-1){
        console.error("ERROR: EasyBrowserStrore Constructor parameter [namespace] must be a String and cannot be empty,");
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
            $namespace:{writable:false,configurable:false,enumerable:false,value:"EBS:"+namespace.toUpperCase()},
            $data:{writable:true,configurable:false,enumerable:false,value:{}},                       
            clearProp:{writable:false,configurable:false,enumerable:false,value:clearProp},
            clear:{writable:false,configurable:false,enumerable:false,value:clear},
        })
        //初始化缓存空间，获取缓存内的相关数值
        cache.localStorage = getCache('localStorage');
        cache.sessionStorage = getCache('sessionStorage');
        cache.cookieStorage = getCache('cookieStorage');
        addProps(props);
        //将命名空间存入命名空间池，避免重复创建
        nameSpacePool[dataBase.$namespace] = dataBase;
        return dataBase
    }   
}
export default EBS


//移出属性 移除时会清除在$data里的数据结构
// function removeProp(prop){
//     delete dataBase.$data[prop];
//     delete schemes[prop]
//     clearProp(prop);
// }

// $schemes:{writable:true,configurable:false,enumerable:false,value:schemes}, 
// addProps:{writable:false,configurable:false,enumerable:false,value:addProps},           
// removeProp:{writable:false,configurable:false,enumerable:false,value:removeProp},
