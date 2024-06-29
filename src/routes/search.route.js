"use strict"

const router = require("express").Router()
const SearchController = require("../controllers/search.controller")
const asyncHandler = require("../helpers/asyncHandler.helper")
const {body} = require("express-validator")
const {authenticateToken} = require("../auth/loginKey.auth")

router.use(asyncHandler(authenticateToken))

router.post("/", [
    body("searchValue")
    .not().isEmpty().withMessage("Search value is required")
    .trim()
], asyncHandler(SearchController.searchUser))

module.exports = router
