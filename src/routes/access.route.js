"use strict"

const AccessController = require("../controllers/access.controller")
const router = require("express").Router()
const asyncHandler = require("../helpers/asyncHandler.helper")
const {body} = require("express-validator")
const {checkApiKey} = require("../auth/apikey.auth")

router.use(asyncHandler(checkApiKey))

router.post("/check-email", 
    [
        body("email")
        .isEmail().withMessage("Email is invalid")
        .normalizeEmail()
        .trim()
    ], asyncHandler(AccessController.confirmValidEmail))

router.post("/sign-up", 
    [
        body("email")
        .isEmail().withMessage("Email is invalid")
        .trim(),

        body("password")
        .not().isEmpty().withMessage("Password is required")
        .trim(),

        body("firstname")
        .not().isEmpty().withMessage("Firstname is required")
        .trim(),

        body("lastname")
        .not().isEmpty().withMessage("Lastname is required")
        .trim(),

        body("birthday")
        .not().isEmpty().withMessage("Birthday is required")
        .trim()
    ], asyncHandler(AccessController.signup))

module.exports = router