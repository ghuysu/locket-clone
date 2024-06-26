"use strict"

const AccountService = require("../services/account.service")
const {OK} = require("../core/succes.response")
const {validationResult} = require("express-validator")

class AccountController {
    static async updateProfileImage(req, res, next) {
        new OK({
            message: "Change profile image successfully",
            metadata: await AccountService.updateProfileImage(req.user, req.file)
        }).send(res)
    }

    static async updateName(req, res, next) {
        new OK({
            message: "Change name successfully",
            metadata: await AccountService.updateName(validationResult(req), req.user, req.body)
        }).send(res)
    }

    static async updateBirthday(req, res, next) {
        new OK({
            message: "Change birthday successfully",
            metadata: await AccountService.updateBirthday(validationResult(req), req.user, req.body)
        }).send(res)
    }

    static async updateEmail(req, res, next) {
        new OK({
            message: "Change email successfully",
            metadata: await AccountService.updateEmail(validationResult(req), req.user, req.body)
        }).send(res)
    }
}

module.exports = AccountController