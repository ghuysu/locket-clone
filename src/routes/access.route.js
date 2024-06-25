"use strict"

const AccessController = require("../controllers/access.controller")
const router = require("express").Router()
const asyncHandler = require("../helpers/asyncHandler.helper")
const {body} = require("express-validator")
const {checkApiKey} = require("../auth/apikey.auth")
const {authenticateToken} = require("../auth/loginKey.auth")

router.use(asyncHandler(checkApiKey))

router.post("/check-email", 
    [
        body("email")
        .isEmail().withMessage("Email is invalid")
        .normalizeEmail()
        .trim()
    ], asyncHandler(AccessController.confirmValidEmail))

module.exports = router