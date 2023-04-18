const jwt = require('jsonwebtoken')
const generateAccessToken = (user) =>{
    return jwt.sign({
        id: user.id,
        isAdmin: user.isAdmin
    }, process.env.JWT_ACCESS_SECRET_KEY,{
        expiresIn: '1h',
    })
}
const generateRefreshToken = (user) =>{
    return jwt.sign({
        id: user.id,
        isAdmin: user.isAdmin
    }, process.env.JWT_REFRESH_SECRET_KEY,{
        expiresIn: '1d'
    })
}

module.exports = {generateAccessToken,generateRefreshToken}