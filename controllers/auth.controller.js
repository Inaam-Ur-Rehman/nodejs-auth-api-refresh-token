const prisma = require('../utils/db')
const createError = require('http-errors')
const jwt = require('jsonwebtoken')

const {encrypt, decrypt} = require("../utils/encdec");
const {generateAccessToken, generateRefreshToken} = require("../utils/generateTokens");


module.exports = {
    register: async (req,res,next)=>{
        const body = req.body
        const {email,password,name} = body
        if(!email || !password || !name){
            return next(createError(400,{
                message: 'Enter valid info'
            }))
        }
        try{
            const newPassword = encrypt(password)
            await prisma.user.create({
                data:{
                    name,
                    email,
                    password:newPassword.toString()
                }
            }).then((newUser)=>{
                res.status(201).send(newUser)
            }).catch((e=>{
                if(e.code === 'P2002'){
                    return res.status(400).send({
                        message: 'User already exists'
                    })
                }
                res.status(400).send({
                    message: e
                })
            }))
        }
        catch (e) {
            next(e)
        }
    },
    login: async (req,res,next)=>{
        if(!req.body){
            return next(createError(400,{
                message: 'Enter valid info'
            }))
        }
        const {email,password} = req.body
        if(!email || !password){
            return next(createError(400,{
                message: 'Enter valid info'
            }))
        }
        try{
            const user = await prisma.user.findFirst({
                where: {
                    email
                }
            })
            if(!user){
                return res.status(400).send({
                    message: "Wrong credentials"
                })
            }
            const decPassword = decrypt(user.password)
            if(decPassword !== password){
                return res.status(400).send({
                    message: "Wrong credentials"
                })
            }
            const access_token = generateAccessToken(user)
            const refresh_token = generateRefreshToken(user)
            const dbToken = await prisma.refreshToken.create({
                data: {
                    token: refresh_token
                }
            })
            if(!dbToken){
                return res.send(400).send({
                    message: "Something went wrong"
                })
            }
            const {password:pwd, ...info} = user
            res.status(200).send({
                user: info,
                accessToken:access_token,
                refreshToken: refresh_token
            })
        }
        catch (e) {
            next(e)
        }

    },
    refresh: async (req,res,next)=>{
        const refreshToken = req?.body?.token

        if(!refreshToken){
            return res.status(401).send({
                message: "You are not authenticated!"
            })
        }
        const dbToken = await prisma.refreshToken.findFirst({
            where: {
                token:refreshToken
            }
        })


        if(!dbToken){
            return res.status(403).send({
                message: "Refresh token is not valid"
            })
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY,async (err,payload)=>{
            if(err){
                return res.status(400).send({
                    message: 'Not a valid token'
                })
            }
            try {
                await prisma.refreshToken.delete({
                    where:{
                        id: dbToken.id
                    }
                })
                const newAccessToken = generateAccessToken(payload)
                const newRefreshToken = generateRefreshToken(payload)

                const addToken = await prisma.refreshToken.create({
                    data:{
                        token: newRefreshToken
                    }
                })
                if(!addToken){
                    return res.status(400).send({
                        message: "Something went wrong"
                    })
                }

                res.status(200).send({
                    accessToken:newAccessToken,
                    refreshToken: newRefreshToken
                })
            }
            catch (e){
                next(e)
            }

        })

    },
    logout: async (req,res,next)=>{
        const refreshToken = req.body.token
        if(!refreshToken){
            return res.status(400).send({
                message: "Bad Request"
            })
        }
        try{
            const token = await prisma.refreshToken.findFirst({
                where: {
                    token: refreshToken
                }
            })
            if(!token){
                return res.status(400).send({
                    message: "Bad Request"
                })
            }
            else{
                await prisma.refreshToken.delete({
                    where:{
                        id: token.id
                    }
                })

                return res.status(200).send({
                    message: "User logout successfully"
                })
            }
        }
        catch (e) {
            next(e)
        }
    }
}