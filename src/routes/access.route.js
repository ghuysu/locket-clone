"use strict"

const router = require("express").Router()
const asyncHandler = require("../helpers/asyncHandler.helper")
const {body} = require("express-validator")
const {checkApiKey} = require("../auth/apikey.auth")
const {authenticateToken} = require("../auth/loginKey.auth")

router.use(asyncHandler(checkApiKey))

module.exports = router