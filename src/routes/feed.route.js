"use strict"

const FeedController = require("../controllers/feed.controller")
const router = require("express").Router()
const asyncHandler = require("../helpers/asyncHandler.helper")
const {authenticateToken}= require("../auth/loginKey.auth")
const {uploadImage} = require("../configs/multer.config")
const {body} = require("express-validator")

router.use(asyncHandler(authenticateToken))

router.post("/create", uploadImage.single('image'), [
    body("description")
    .not().isEmpty().withMessage("Description is required"),

    body("visibility")
    .not().isEmpty().withMessage("Visibility is required")
    ], asyncHandler(FeedController.createFeed))

router.patch("/update/:feedId", [
    body("description")
    .not().isEmpty().withMessage("Description is required"),

    body("visibility")
    .not().isEmpty().withMessage("Visibility is required")
    ], asyncHandler(FeedController.updateFeed))

module.exports = router