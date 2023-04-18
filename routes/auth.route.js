const express = require('express')
const {login, register, refresh, logout} = require("../controllers/auth.controller");
const router = express.Router()
const verifyJWT = require('../middlewares/verifyJWT')

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', verifyJWT ,logout)

module.exports = router