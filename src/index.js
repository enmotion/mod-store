"use strict";
const R = require('ramda');
import edd from "easy-door-data";
import Crypto from "mod-crypto";
import cookiStore from "mod-cookie";
import purifyStore from "./libs/purify";

let nameSpacePool={};

function ModStore(config){
    const storeTypes = {'L':'l','S':'s'};
    const dataBase = {};
    const schemes = {};
    const cache = {l:{},s:{},c:{}};
    //创建aes加密器，该创建方式会根据密钥自动处理成加密方式
    let aesc = {};
    //检测运行环境,是否支持 localStorage,sessionStorage如果不支持则直接更换成cookie方式 解决兼容问题
    const storeEngine= {
        l : hasApi(window.localStorage) ? window.localStorage : cookiStore,
        s : hasApi(window.sessionStorage) ? window.sessionStorage : cookiStore,
        c : cookiStore
    }
    // 检测本地存储方法是否可行
    function hasApi(storage){
        try {
            storage.setItem('ModStore','9527');
            var str = storage.getItem('ModStore');
            storage.removeItem('ModStore');
            return str == '9527' ? true : false
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
                let item = schemes[i]
                //配置对象的观察模式
                Object.defineProperty(dataBase.$data,i,{
                    configurable:true,//因为设置了set 与 get 方法，因此需修正可配置选项为true,属性可以被删除
                    enumerable:true,//同上，属性可以被枚举
                    set:function(value){
                        let types = item.type && item.type.constructor == Function ? [item.type] : item.type;
                        if(types && types.indexOf(value.constructor)<0){
                            console.error("ERROR:STORAGE [" + dataBase.$namespace + "] $data."+i+" invalid value,type check failed,Expected [" +R.pluck("name")(types)+"], got "+value.constructor.name)
                        }else{
                            let cacheData = cache[item.method];
                            cacheData[i] = {
                                v: value,
                                m: item.method,
                                t: Math.round(Date.now() / 1000) //刷新更新时间
                            }
                            setCache(item.method,cacheData)
                        }
                    },
                    get:function(){
                        let now = Math.round(Date.now() / 1000);                        
                        let cacheData = cache[item.method];
                        if(cacheData.constructor == Object && cacheData[i] && (item.expireTime == null || now < item.expireTime + cacheData[i].t)){
                            var data = cacheData[i];
                            if(item.once){
                               delete cache[item.method][i];
                               setCache(item.method, cache[item.method]);
                            }
                            let types = item.type && item.type.constructor == Function ? [item.type] : item.type;
                            //如果值类型不对，则返回默认值，否则返回正确值
                            if(types && types.indexOf(data.v.constructor)>-1){
                                return data.v
                            }else{
                                return item.default && item.default.constructor == Function ? item.default(): item.default
                            }                           
                        }else{
                            return item.default && item.default.constructor == Function ? item.default(): item.default
                        }                   
                    }
                })
            }
            Object.preventExtensions(dataBase.$data)
        }
    }
    //读取缓存
    function getCache(engineNameStr){
        return aesc.deCryptoStrToData(storeEngine[engineNameStr].getItem(dataBase.$namespace));
    }
    //写入缓存
    function setCache(engineNameStr,data){
        storeEngine[engineNameStr].setItem(dataBase.$namespace,aesc.enCryptoDataToStr(data));
    }
    //清除属性 清除时，仅仅删除在储值空间里的值 
    function clearProp(prop){
        delete cache.l[prop];
        setCache('l',cache.l);
        delete cache.s[prop];
        setCache('s',cache.s)
        delete cache.c[prop];
        setCache('c',cache.c)
    }
    //清除整个缓存
    function clear(type){
        let clearType = ['SELF','MS','ALL'];        
        type = clearType.indexOf(type && type.toUpperCase())<0? clearType[0] : type;
        dataBase.$data={};
        cache.l = {};
        cache.s = {};
        cache.c = {};
        switch(type){
            case 'SELF':                             
                storeEngine.l.removeItem(dataBase.$namespace)
                storeEngine.s.removeItem(dataBase.$namespace)
                storeEngine.c.removeItem(dataBase.$namespace)
            break;
            case 'MS':                  
                for(var i in storeEngine.l){
                    if(i.split(':')[0] == 'MS'){
                        storeEngine.l.removeItem(i)
                    }
                }
                for(var i in storeEngine.s){
                    if(i.split(':')[0] == 'MS'){
                        storeEngine.s.removeItem(i)
                    }
                }
                //cookie的遍历方式比较特殊，需要先通过无参方式获取全部的cookie对象，方可进行清除
                for(var i in storeEngine.c.getItem()){
                    if(i.split(':')[0] == 'MS'){
                        storeEngine.c.removeItem(i)
                    }
                }
            break;
            case 'ALL':
                storeEngine.l.clear();
                storeEngine.s.clear();
                storeEngine.c.clear();              
            break;
        }
    }
    //config 必须为对象，不可为空或缺失
    if(!edd(config,{type:Object},"Constructor parameter [config]")){
        return {}
    }else if(!edd(config.namespace,{type:String},"Constructor parameter config.namespace") || !edd(config.props,{type:Object},"Constructor parameter config.props")){
        //config.namespace 必须为字符，不可为空或缺失 config.props必须为对象，不可为空或者缺失
        return {}
    }else if(R.keys(nameSpacePool).indexOf("MS:"+config.namespace.toUpperCase())>-1){
        return {}
    }
    aesc = new Crypto(config.key)
    /*  * 定义dataBase的属性
        * $namespace 【不可写，不可配置，不可枚举】 并在创建时依照规则赋值命名
        * $data 【可写，不可配置，不可枚举】
        * clearProp 【 不可写，不可配置，不可枚举】清除属性
        * clearData 【 不可写，不可配置，不可枚举】清除所有属性，'SELF','MS','ALL'
    */
    Object.defineProperties(dataBase,{
        $namespace:{writable:false,configurable:false,enumerable:false,value:"MS:"+config.namespace.toUpperCase()},
        $data:{writable:true,configurable:false,enumerable:false,value:{}},                       
        clearProp:{writable:false,configurable:false,enumerable:false,value:clearProp},
        clearData:{writable:false,configurable:false,enumerable:false,value:clear},
    })
    //先设置属性，生成schemes 与 $data,此处应在purifyStore之前，否则无法purifyStore
    addProps(config.props);
    //初始化缓存空间,并依照schemes净化冗余的值，获取缓存内的相关数值
    var outData = purifyStore([getCache('l'),getCache('s'),getCache('c')],schemes)
    cache.l=outData.l;
    setCache('l',cache.l)
    cache.s=outData.s;
    setCache('s',cache.s)
    cache.c=outData.c;
    setCache('c',cache.c)   
    //将命名空间存入命名空间池，避免重复创建
    nameSpacePool[dataBase.$namespace] = dataBase;
    Object.preventExtensions(dataBase)
    return dataBase      
}
export default ModStore