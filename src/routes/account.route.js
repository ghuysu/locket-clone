"use strict"

const AccountController = require("../controllers/account.controller")
const router = require("express").Router()
const {body} = require("express-validator")
const asyncHandler = require("../helpers/asyncHandler.helper")
const {authenticateToken} = require("../auth/loginKey.auth")
const {uploadImage} = require("../configs/multer.config")

router.use(asyncHandler(authenticateToken))

router.post("/friend/send-invite", [
    body("friendId")
    .not().isEmpty().withMessage("Friend id is required")
    .trim()
], asyncHandler(AccountController.sendInvite))

router.post("/friend/remove-invite", [
    body("friendId")
    .not().isEmpty().withMessage("Friend id is required")
    .trim()
], asyncHandler(AccountController.removeInvite))

router.post("/friend/remove", [
    body("friendId")
    .not().isEmpty().withMessage("Friend id is required")
    .trim()
], asyncHandler(AccountController.removeFriend))

router.post("/friend/accept", [
    body("friendId")
    .not().isEmpty().withMessage("Friend id is required")
    .trim()
], asyncHandler(AccountController.acceptFriend))

router.patch("/name", [
    body("lastname")
    .not().isEmpty().withMessage("Lastname is required")
    .trim(),

    body("firstname")
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

router.patch("/profile-image", uploadImage.single('image'), asyncHandler(AccountController.updateProfileImage))

module.exports = router