"use strict"

const FeedService = require("../services/feed.service")
const {OK, CREATED} = require("../core/succes.response")
const {validationResult} = require("express-validator")

class FeedController {
    static createFeed = async (req, res, next) => {
        new CREATED({
            message: "Create feed successfully",
            metadata: await FeedService.createFeed(validationResult(req), req.user, req.body, req.file)
        }).send(res)
    }

    static updateFeed = async (req, res, next) => {
        new OK({
            message: "Updated feed successfully",
            metadata: await FeedService.updateFeed(validationResult(req), req.user, req.params, req.body)
        }).send(res)
    }
}

module.exports = FeedController