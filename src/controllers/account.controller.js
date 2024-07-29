"use strict";

const AccountService = require("../services/account.service");
const { OK } = require("../core/succes.response");
const { validationResult } = require("express-validator");

class AccountController {
  static async sendInvite(req, res, next) {
    new OK({
      message: "Sent invite successfully",
      metadata: await AccountService.sendInvite(
        validationResult(req),
        req.user,
        req.body
      ),
    }).send(res);
  }

  static async removeInvite(req, res, next) {
    new OK({
      message: "Removed invite successfully",
      metadata: await AccountService.removeInvite(
        validationResult(req),
        req.user,
        req.body
      ),
    }).send(res);
  }

  static async removeInviteFromReceiver(req, res, next) {
    new OK({
      message: "Removed invite from receiver successfully",
      metadata: await AccountService.removeInviteFromReceiver(
        validationResult(req),
        req.user,
        req.body
      ),
    }).send(res);
  }

  static async removeFriend(req, res, next) {
    new OK({
      message: "Remove friend successfully",
      metadata: await AccountService.removeFriend(
        validationResult(req),
        req.user,
        req.body
      ),
    }).send(res);
  }

  static async acceptFriend(req, res, next) {
    new OK({
      message: "Accept friend successfully",
      metadata: await AccountService.acceptFriend(
        validationResult(req),
        req.user,
        req.body
      ),
    }).send(res);
  }

  static async updateProfileImage(req, res, next) {
    new OK({
      message: "Change profile image successfully",
      metadata: await AccountService.updateProfileImage(req.user, req.file),
    }).send(res);
  }

  static async updateName(req, res, next) {
    new OK({
      message: "Change name successfully",
      metadata: await AccountService.updateName(
        validationResult(req),
        req.user,
        req.body
      ),
    }).send(res);
  }

  static async updateBirthday(req, res, next) {
    new OK({
      message: "Change birthday successfully",
      metadata: await AccountService.updateBirthday(
        validationResult(req),
        req.user,
        req.body
      ),
    }).send(res);
  }

  static async updateEmail(req, res, next) {
    new OK({
      message: "Change email successfully",
      metadata: await AccountService.updateEmail(
        validationResult(req),
        req.user,
        req.body
      ),
    }).send(res);
  }

  static async deleteAccount(req, res, next) {
    new OK({
      message: "Deleted account successfully",
      metadata: await AccountService.deleteAccount(req.user),
    }).send(res);
  }

  static async updateEmail(req, res, next) {
    new OK({
      message: "Send code for changing email successfully",
      metadata: await AccountService.updateEmail(
        validationResult(req),
        req.user,
        req.body
      ),
    }).send(res);
  }

  static async confirmEmail(req, res, next) {
    new OK({
      message: "Confirm change email successfully",
      metadata: await AccountService.confirmChangeEmail(
        validationResult(req),
        req.user,
        req.body
      ),
    }).send(res);
  }
}

module.exports = AccountController;
