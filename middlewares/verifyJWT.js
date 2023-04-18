const jwt = require('jsonwebtoken')

const verifyJWT = (req,res,next) =>{
    const authHeader = req.headers.authorization
    if(authHeader){
        const token = authHeader.split(" ")[1]
        jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY,(err,payload)=>{
            if(err){
                return res.status(403).send({
                    message: "Token is not valid"
                })
            }
            req.user = payload
            next()
        })
    }
    else{
        res.status(401).send({
            message: "You are not authenticated"
        })
    }
}

module.exports = verifyJWT