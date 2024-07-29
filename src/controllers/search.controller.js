"use strict"

const SearchService = require("../services/search.service")
const {OK} = require("../core/succes.response")
const {validationResult} = require("express-validator")

class SearchController {
    static searchUser = async (req, res, next) => {
        new OK({
            message: "Search successfully",
            metadata: await SearchService.searchUser(req.user, req.params)
        }).send(res)
    }

    static getUserInfor = async (req, res, next) => {
        new OK({
            message: "Get user information successfully",
            metadata: await SearchService.getUserInfor(req.user, req.params)
        }).send(res)
    }
}

module.exports = SearchController