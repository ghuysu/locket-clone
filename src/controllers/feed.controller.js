"use strict"

const FeedService = require("../services/feed.service")
const {OK, CREATED} = require("../core/succes.response")
const {validationResult} = require("express-validator")

class FeedController {
    static createFeed = async (req, res, next) => {
        new CREATED({
            message: "Created feed successfully",
            metadata: await FeedService.createFeed(validationResult(req), req.user, req.body, req.file)
        }).send(res)
    }

    static updateFeed = async (req, res, next) => {
        new OK({
            message: "Updated feed successfully",
            metadata: await FeedService.updateFeed(validationResult(req), req.user, req.params, req.body)
        }).send(res)
    }

    static deleteFeed = async (req, res, next) => {
        new OK({
            message: "Deleted feed successfully",
            metadata: await FeedService.deleteFeed(req.user, req.params)
        }).send(res)
    }

    static getEveryoneFeed = async (req, res, next) => {
        new OK({
            message: "Get all-friend feeds successfully",
            metadata: await FeedService.getEveryoneFeed(req.user, req.query)
        }).send(res)
    }

    static getCertainFeed = async (req, res, next) => {
        new OK({
            message: "Get certain-friend feeds successfully",
            metadata: await FeedService.getCertainFeed(req.user, req.params, req.query)
        }).send(res)
    }
}

module.exports = FeedController