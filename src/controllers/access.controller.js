"use strict"

const AccessService = require("../services/access.service")
const {OK, CREATED} = require("../core/succes.response")
const {validationResult} = require("express-validator")

class AccessController {
    static confirmValidEmail = async (req, res, next) => {
        new OK({
            message: "Sent code successfully",
            metadata: await AccessService.confirmValidEmail(validationResult(req), req.body)
        }).send(res)
    }

    static signup = async (req, res, next) => {
        new CREATED({
            message: "Created user successfully",
            metadata: await AccessService.signup(validationResult(req), req.body)
        }).send(res)
    }
}

module.exports = AccessController