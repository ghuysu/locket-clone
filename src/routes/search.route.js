"use strict";

const router = require("express").Router();
const SearchController = require("../controllers/search.controller");
const asyncHandler = require("../helpers/asyncHandler.helper");
const { body } = require("express-validator");
const { authenticateToken } = require("../auth/loginKey.auth");

router.use(asyncHandler(authenticateToken));

router.get("/:searchValue", asyncHandler(SearchController.searchUser));

router.get("/user/:searchId", asyncHandler(SearchController.getUserInfor));

module.exports = router;
