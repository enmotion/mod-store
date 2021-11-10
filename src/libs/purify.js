import * as R from "ramda";
export default function purifyStore(dataArray,target,value){
    var cacheData = {};
    var outData ={'l':{},'s':{},'c':{}};  
    for(var t in dataArray){cacheData = R.merge(dataArray[t],cacheData)}
    for(let i in cacheData){
        if(target[i] && target[i].method == cacheData[i].m){
            outData[cacheData[i].m][i] = cacheData[i]
        }
    }    
    return outData
}