"use strict"

const AccountController = require("../controllers/account.controller")
const router = require("express").Router()
const {body} = require("express-validator")
const asyncHandler = require("../helpers/asyncHandler.helper")
const {authenticateToken} = require("../auth/loginKey.auth")

router.use(asyncHandler(authenticateToken))

router.patch("/name", [
    body("lastname")
    .not().isEmpty().withMessage("Lastname is required")
    .trim(),

    body("first")
    .not().isEmpty().withMessage("Firstname is required")
    .trim()
    ], asyncHandler(AccountController.updateName))

router.patch("/birthday", [
    body("birthday")
    .not().isEmpty().withMessage("Birthday is required")
    .trim()
    ], asyncHandler(AccountController.updateBirthday))

router.patch("/email", [
    body("email")
    .not().isEmpty().withMessage("Email is required")
    .isEmail().withMessage("Email is invalid")
    .normalizeEmail()
    ], asyncHandler(AccountController.updateEmail))

module.exports = router