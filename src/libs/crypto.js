/*
* aes-crypto
*
*/
const aes = require('aes-js');

function AesCrypto(key){
    //验证正则，必须为16字符长度，限英文字母大小写，英文符号，数字
    const Reg= /^[a-z_A-Z0-9-\.!@#\$%\\\^&\*\)\(\+=\{\}\[\]\/",'<>~\·`\?:;|]{16,16}$/;
    //创建KEY
    const aesKey = key ? key.constructor == String && key.match(Reg) ? createKey(key)
    :console.warn("ERROR:Crypto Key must be String with 16 length , only allowed number or letter characters, crypto is not working!")
    :null;    
    //生成密钥，所有字符转字符码，并创建16位数值的数组！
    function createKey(key){let code=[];for(var i in key){code.push(key[i].charCodeAt())};return code}
    //加密 对象入参字符出参
    function enCryptoData(data){
        var str = JSON.stringify(data)
        //包含加密的key 则需加密才可存入数据
        if(aesKey){         
            var textBytes = aes.utils.utf8.toBytes(str);
            var aesCtr = new aes.ModeOfOperation.ctr(aesKey, new aes.Counter(5));
            var encryptedBytes = aesCtr.encrypt(textBytes);
            var encryptedHex = aes.utils.hex.fromBytes(encryptedBytes);
            return encryptedHex;
        }else{
            return str
        }
    }
    //解密 字符入参对象出参
    function deCryptoData(str){
        //包含加密的key 则需解密才可取出数据
        if(aesKey && str){
            try{
                var encryptedBytes = aes.utils.hex.toBytes(str);
                var aesCtr = new aes.ModeOfOperation.ctr(aesKey, new aes.Counter(5));
                var decryptedBytes = aesCtr.decrypt(encryptedBytes);
                var decryptedText = aes.utils.utf8.fromBytes(decryptedBytes);
                return JSON.parse(decryptedText);
            }catch(err){
                console.error("ERROR:[" + dataBase.$namespace + "] try to get data with wrong key!")
                return {}
            }            
        }else{
            return JSON.parse(str);
        }
    }
    let crypto = {};
    Object.defineProperties(crypto,{
        enCryptoData:{value:enCryptoData,configurable:false,writable:false,enumerable:false},
        deCryptoData:{value:deCryptoData,configurable:false,writable:false,enumerable:false}
    })
    return crypto
}
export default AesCrypto