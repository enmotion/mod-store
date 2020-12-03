"use strict";
const R = require('ramda');

// const MBS={
//     DebugMode:false,
//     DataBase: {},//实例注册表
//     StorageType:{//存储方式表
//         "L":localStorage,
//         "S":sessionStorage
//     },
//     /*创建一个实例
//         1. 在MBS中，所有用于管理缓存的对象，都是MBS的实例对象;
//         2. 设计上，不允许实例对象重复创建，创建依照，创建时的输入的【domain】和【version】双信息进行创建,【version】可不填写;
//         3. 实例创建后，通过 addItems 的方式 创建存储对象的注册表 schemes 通过 removeItems 对表进行删除操作
//         4. 储值操作分为，setItem,getItem,clearItem 三种方式进行
//     */
//     creatStorage: function(domain, version) { //创建存储命名空间,可填入domain与version信息
//         let that = this;
//         /*  私有方法 */
//         // 设置存储类型值
//         function setStorageType(namespace,key,type){
//             let typeEnum = R.keys(MBS.StorageType);//获取全部枚举类型
//             //如果类型值包含于类型枚举值时
//             if(typeEnum.indexOf(type)>-1){
//                 return type.toUpperCase();
//             }else{
//                 warning("WARNING: STORAGE [" + namespace + "] addItems Invalid prop: type check failed for prop ["+key+"]. Expected 'L' or 'S', got "+type+". instead with 'S'")
//                 return "S"
//             }
//         };
//         /*1.
//             1.1 domain必须不为空，且类型为String类;否则报错;
//             1.2 依照规则创建命名空间;
//         */
//         if (R.isEmpty(domain) || !(domain.constructor == String)) { //创建存储空间，必须填入 domain
//             console.error("ERROR: createStorage Method first input parameter cannot be empty or non string type");
//             return;
//         };
//         that.namespace = "MBS:" + (domain || "") + (version ? "/" + version : "") + "#"; //声明命名空间名称

//         /*2.
//             2.1 判断该命名空间是否已经创建，如果已经创建，则不会重复创建命名空间,直接返回已有实例并提示警告信息;
//             2.2 赋值相关属性
//             3.3 组装输出的实例对象out
//         */
//         if (R.keys(MBS.DataBase).indexOf(that.namespace) < 0) {
//             that.domain=domain;//应用作用域
//             that.version=version;//应用版本号
//             that.namespace=that.namespace;//应用空间路径
//             that.schemes={};//所有item描述文档
//             let out = {
//                 //返回当前实例构造例信息
//                 get namespace(){
//                     return that.namespace;
//                 },
//                 get getInfo(){
//                     return {
//                         domain:that.domain,
//                         version:that.version,
//                         schemes:that.schemes
//                     }
//                 },
//                 //给实例添加新的数据元素表，未添加的元素无法赋值储存
//                 addItems: function(props) {
//                     if (!props.constructor == Object) { //必须为object对象
//                         console.error("ERROR: STORAGE [" + that.namespace + "] addItems method paramater must be an instanc of Object") //如果数据模型格式非对象，则直接报错
//                     } else {
//                         var data = {}
//                         for (let i in props) { //初始化对象的基本属性
//                             data[i] = {
//                                 type: props[i].type == null ? String : props[i].type,//元素类型
//                                 default: props[i].default == null ? null : props[i].default,//元素返回的默认值，默认情况下为null
//                                 method: setStorageType(that.namespace,i,props[i].method)//存储方式
//                             }
//                         }
//                         that.schemes = R.merge(that.schemes, data); //将数据模型合并至命名空间下,合并的方式避免了数据的随意创建
//                     }
//                 },                
//                 //删除元素表中所注册的元素。
//                 removeItem: function(key) {//删除储值，并且注销注册
//                     if (R.keys(that.schemes).indexOf(key) < 0) {
//                         warning("STORAGE:[" + that.namespace + "] try to removeItem: [" + key + "] with error, target is not exist in schemes, But the cache operation is still executed with sessionStorage & localStorage!");
//                         window.localStorage.removeItem(that.namespace + key); 
//                         return;
//                     } else {
//                         MBS.StorageType[that.schemes[key]["method"]].removeItem(that.namespace + key)
//                         delete that.schemes[key];
//                     }
//                 },
//                 // ==========================================================================================
//                 //储值元素
//                 setItem:function(key, value, expireTime){
//                     if (R.keys(that.schemes).indexOf(key) < 0) {//如果元素 被注册，则直接返回错误，并终止操作
//                         console.error("ERROR: STORAGE [" + that.namespace + "] try to setItem: [" + key + "] failure , target is not exist in schemes");
//                         return null;
//                     } else {
//                         //获取元素允许的数据类型列表
//                         let types = that.schemes[key].type.constructor == Function ? [that.schemes[key].type] : that.schemes[key].type;
//                         //如果元素数据类型不符合注册时所设置的类型，则提示错误，终止操作
//                         if (R.pluck("name")(types).indexOf(value.constructor.name) < 0 && types != "") {
//                             console.error("ERROR: STORAGE [" + that.namespace + "] try to setItem: [" + key + "] failure,expect [" + R.pluck("name")(types) + "] but got [" + value.constructor.name + "]");
//                         } else {
//                             //组装用于存储的数据类型
//                             let data = {
//                                 value: value,
//                                 type: value.constructor.name,
//                                 expireTime: expireTime || null,//记录过期时间
//                                 updataTime: Math.round(Date.now() / 1000) //刷新更新时间
//                             }
//                             //依照元素注册时所设置的存储方式进行数据存储
//                             MBS.StorageType[that.schemes[key]["method"]].setItem(that.namespace + key, JSON.stringify(data))
//                             return data
//                         }
//                     }
//                 },
//                 //获取元素值
//                 getItem: function(key,c) {
//                     //配置获取数据的条件
//                     var c=c||{};
//                     let condition = {
//                         once:c.once || false,//获取后，将删除元素的存储值
//                         freshness:c.freshness || null,//新鲜度要求，存储保存时间，不可超过该新鲜度，否则返回的是元素的默认值，但是不会清除该元素
//                     };
//                     let now = Math.round(Date.now() / 1000);//获取取值的当前时间，秒为单位
//                     if (R.keys(that.schemes).indexOf(key) < 0) {//判断元素是否在注册表内，如不在则直接报错并返回 null 值
//                         console.error("ERROR: STORAGE [" + that.namespace + "] try to getItem: [" + key + "] failure , target is not exist in schemes");
//                         return null;
//                     } else {
//                         let data = JSON.parse(MBS.StorageType[that.schemes[key]["method"]].getItem(that.namespace + key));//获取元素的存储值
//                         if (data != null) {//如存贮值不为null时
//                             if ((condition.freshness == null || (now - data.updataTime) <= condition.freshness) && (data.expireTime == null || now < data.expireTime)) {//是否过期或不满足新鲜度要求
//                                 if (condition.once) {//是否为获取后自动销毁
//                                     MBS.StorageType[that.schemes[key]["method"]].removeItem(that.namespace + key)
//                                 }
//                                 return data.value
//                             } else {
//                                 if(data.expireTime != null && !now < data.expireTime){//如果该元素设置有超时时间戳，且已经超过有效期，则本次操作将清除该元素的存储数值
//                                     MBS.StorageType[that.schemes[key]["method"]].removeItem(that.namespace + key)
//                                 }
//                                 //返回默认值，并提示信息
//                                warning("WARNING: STORAGE [" + that.namespace + "] try to getItem: [" + key + "] value failure , the value is overtime or freshness requirement is not satisfied , Now return to the default value [" + that.schemes[key]['default']+"]");
//                                 return that.schemes[key]['default']
//                             }
//                         } else {//如果缓存中，不存在该元素的存储值，则返回默认值，并输出警告信息
//                            warning("WARNING: STORAGE [" + that.namespace + "] try to getItem: [" + key + "] value failure , The value has not been saved , Now return to the default value [" + that.schemes[key]['default']+"]");
//                             return that.schemes[key]['default']
//                         }
//                     }
//                 },
//                 //清空元素
//                 clearItem: function(key){
//                     if (R.keys(that.schemes).indexOf(key) < 0) { //如果储值未被注册时，清除请求终止
//                        warning("WARNING: STORAGE [" + that.namespace + "] try to clearItem: [" + key + "] failure , target is not exist in schemes");                        
//                         return;
//                     } else { //储值有注册时，依照元素定义的存储方式清除相关数据
//                         MBS.StorageType[that.schemes[key]["method"]].removeItem(that.namespace + key)
//                     }
//                 },
//             };
//             MBS.DataBase[that.namespace] = out ; //注册该实例至实例表
//             return out  //返回实例
//         }else{
//             //如果该实例已经被创建，则弹出提示，并返回实例
//            warning("WARNING: STORAGE ["+that.namespace+"] the namespace is already occupied by the instance, so there is no need to create it repeatedly ")
//             return MBS.DataBase[that.namespace]
//         }       
//     },
//     //清除实例操作
//     clearStorage:function(c){
//         var c = c||{}
//         //修正C入参配置值
//         c.ignoreNameSpace = R.isNil(c.ignoreNameSpace)?[]:c.ignoreNameSpace;
//         c.isSelfishMode  = R.isNil(c.isSelfishMode)?true:c.isSelfishMode;
//         let config = {
//             ignoreNameSpace: c.ignoreNameSpace.constructor == Array ? c.ignoreNameSpace:[],//除开以下命名空间数据
//             isSelfishMode: c.isSelfishMode.constructor == Boolean ? c.isSelfishMode:true,//仅仅清除mod-browser-storage内注册缓存空间
//         };
//         //获取当前注册的命名空间值
//         let dataBaseNameSpace = R.keys(MBS.DataBase);
//         //缓存内已经储值数据 
//         let localStorageDataKeys = R.keys(window.localStorage);
//         let sessionStorageDataKeys = R.keys(window.sessionStorage);
//         //提出本次清除操作，需忽视的命名空间
//         let ignoreNameSpace = c.ignoreNameSpace.map(element => {
//             let allowType = [String,Object]
//             if(allowType.indexOf(element.constructor)>-1){
//                 if(element.constructor == Object && element.domain.constructor!= String){
//                     console.error("ERROR: clearStroge Method Input parameter data type error, expect parameter [domain] as String but got"+" ["+element.domain+":"+ element.domain.constructor.name+"]")
//                     return;
//                 }else{
//                     if(element.constructor== String){
//                         element = "MBS:" + element + "#";
//                         return element;
//                     }else{
//                         element = "MBS:" + (element.domain || "") + (element.version ? "/" + element.version : "") + "#";
//                         return element;
//                     }                    
//                 }
//             }else{
//                 console.error("ERROR: clearStroge Method Input parameter data type error, expect array or object but got"+" ["+element+":"+ element.constructor.name+"]")
//                 return;
//             }
//         });
//         dataBaseNameSpace.forEach(key=>{
//             if(ignoreNameSpace.indexOf(key)<0){
//                 delete MBS.DataBase[key];
//             }
//         })
//         //清除localStorage
//         localStorageDataKeys.forEach(key=>{
//             let namespace = key.split("#")[0]+"#";
//             let keyName = key.split("#")[1];
//             if(ignoreNameSpace.indexOf(namespace)<0){//如果该命名空间不在忽视列表里
//                 if( dataBaseNameSpace.indexOf(namespace)>-1 || ! config.isSelfishMode){
//                     window.localStorage.removeItem(key)
//                 }                
//             }else{
//                 try{
//                     if(MBS.DataBase[namespace].getInfo.schemes[keyName].method=="S"){//如果被忽视的值，存储属性为"S"
//                         window.localStorage.removeItem(key)//依然需要清除
//                     } 
//                 }catch(e){
//                     //window.localStorage.removeItem(key)//依然需要清除
//                 }                                     
//             }
//         })
//         //清除sessionStorage
//         sessionStorageDataKeys.forEach(key=>{
//             let namespace = key.split("#")[0]+"#";
//             let keyName = key.split("#")[1];
//             if(ignoreNameSpace.indexOf(namespace)<0){
//                 if( dataBaseNameSpace.indexOf(namespace)>-1 || ! config.isSelfishMode){
//                     window.sessionStorage.removeItem(key)
//                 }                
//             }else{
//                 try{
//                     if(MBS.DataBase[namespace].getInfo.schemes[keyName].method=="L"){
//                         window.sessionStorage.removeItem(key)//依然需要清除
//                     }
//                 }catch(e){
//                     //window.sessionStorage.removeItem(key)//依然需要清除
//                 }          
//             }
//         })
//     },    
// }
