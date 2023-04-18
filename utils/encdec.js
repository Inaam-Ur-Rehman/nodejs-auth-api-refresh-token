const CryptoJS = require("crypto-js");

const encrypt = (password) =>{
    return CryptoJS.AES.encrypt(password,process.env.ECRYPTION_KEY)
}
const decrypt = (password) =>{
    const bytes = CryptoJS.AES.decrypt(password,process.env.ECRYPTION_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
}

module.exports = {encrypt,decrypt}
