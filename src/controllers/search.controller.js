"use strict"

const SearchService = require("../services/search.service")
const {OK} = require("../core/succes.response")
const {validationResult} = require("express-validator")

class SearchController {
    static searchUser = async (req, res, next) => {
        new OK({
            message: "Search successfully",
            metadata: await SearchService.searchUser(validationResult(req), req.user, req.body)
        }).send(res)
    }
}

module.exports = SearchController