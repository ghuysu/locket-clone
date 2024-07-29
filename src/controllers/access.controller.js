"use strict";

const AccessService = require("../services/access.service");
const { OK, CREATED } = require("../core/succes.response");
const { validationResult } = require("express-validator");

class AccessController {
  static changePassword = async (req, res, next) => {
    new OK({
      message: "Change password successfully",
      metadata: await AccessService.changePassword(
        validationResult(req),
        req.body
      ),
    }).send(res);
  };

  static signout = async (req, res, next) => {
    new OK({
      message: "Sign out successfully",
      metadata: await AccessService.signout(req.user),
    }).send(res);
  };

  static signin = async (req, res, next) => {
    new OK({
      message: "Sign in successfully",
      metadata: await AccessService.signin(validationResult(req), req.body),
    }).send(res);
  };

  static confirmValidEmail = async (req, res, next) => {
    new OK({
      message: "Sent code successfully",
      metadata: await AccessService.confirmValidEmail(
        validationResult(req),
        req.body
      ),
    }).send(res);
  };

  static confirmOwner = async (req, res, next) => {
    new OK({
      message: "Sent code successfully",
      metadata: await AccessService.confirmOwner(
        validationResult(req),
        req.body
      ),
    }).send(res);
  };

  static signup = async (req, res, next) => {
    new CREATED({
      message: "Created user successfully",
      metadata: await AccessService.signup(validationResult(req), req.body),
    }).send(res);
  };
}

module.exports = AccessController;
