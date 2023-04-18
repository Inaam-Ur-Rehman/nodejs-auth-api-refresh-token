const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const helmet = require('helmet')

const verifyJWT = require('./middlewares/verifyJWT')


const authRoute = require('./routes/auth.route')

dotenv.config()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(helmet.default())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))


app.get('/',(req,res)=>{
    res.status(200).send({
        message: 'API is healthy'
    })
})

app.use('/api/auth', authRoute)

app.delete('/delete/:id',verifyJWT,(req,res)=>{
    if(req.user.id === req.params.id || req.user.isAdmin){
        return res.status(200).send({
            message: "User has been deleted"
        })
    }
    else {
        return res.status(200).send({
            message: "You are not allowed to delete this user"
        })
    }

})




app.use((err, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500; // set status code to 500 if not set or is 200
    res.status(statusCode).json({
        status: statusCode,
        message: err.message || 'Internal Server Error'
    });
});




app.listen(PORT,(err)=>{
    if(err) console.log('Error in server setup')
    console.log(`Server is running at port ${PORT}`)
})