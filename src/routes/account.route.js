"use strict";

const AccountController = require("../controllers/account.controller");
const router = require("express").Router();
const { body } = require("express-validator");
const asyncHandler = require("../helpers/asyncHandler.helper");
const { authenticateToken } = require("../auth/loginKey.auth");
const { uploadImage } = require("../configs/multer.config");

router.use(asyncHandler(authenticateToken));

router.post(
  "/friend/send-invite",
  [
    body("friendId")
      .not()
      .isEmpty()
      .withMessage("Friend id is required")
      .trim(),
  ],
  asyncHandler(AccountController.sendInvite)
);

router.post(
  "/friend/remove-invite",
  [
    body("friendId")
      .not()
      .isEmpty()
      .withMessage("Friend id is required")
      .trim(),
  ],
  asyncHandler(AccountController.removeInvite)
);

router.post(
  "/friend/remove-invite-receiver",
  [
    body("friendId")
      .not()
      .isEmpty()
      .withMessage("Friend id is required")
      .trim(),
  ],
  asyncHandler(AccountController.removeInviteFromReceiver)
);

router.post(
  "/friend/remove",
  [
    body("friendId")
      .not()
      .isEmpty()
      .withMessage("Friend id is required")
      .trim(),
  ],
  asyncHandler(AccountController.removeFriend)
);

router.post(
  "/friend/accept",
  [
    body("friendId")
      .not()
      .isEmpty()
      .withMessage("Friend id is required")
      .trim(),
  ],
  asyncHandler(AccountController.acceptFriend)
);

router.patch(
  "/name",
  [
    body("lastname").not().isEmpty().withMessage("Lastname is required").trim(),

    body("firstname")
      .not()
      .isEmpty()
      .withMessage("Firstname is required")
      .trim(),
  ],
  asyncHandler(AccountController.updateName)
);

router.patch(
  "/birthday",
  [body("birthday").not().isEmpty().withMessage("Birthday is required").trim()],
  asyncHandler(AccountController.updateBirthday)
);

router.post(
  "/email",
  [
    body("oldEmail")
      .not()
      .isEmpty()
      .withMessage("Old email is required")
      .isEmail()
      .withMessage("Old email is invalid")
      .normalizeEmail(),

    body("newEmail")
      .not()
      .isEmpty()
      .withMessage("New email is required")
      .isEmail()
      .withMessage("New email is invalid")
      .normalizeEmail(),

    body("password").not().isEmpty().withMessage("Password is required").trim(),
  ],
  asyncHandler(AccountController.updateEmail)
);

router.patch(
  "/confirm-email",
  [
    body("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid")
      .normalizeEmail(),
  ],
  asyncHandler(AccountController.confirmEmail)
);

router.patch(
  "/profile-image",
  uploadImage.single("image"),
  asyncHandler(AccountController.updateProfileImage)
);

router.delete("/delete", asyncHandler(AccountController.deleteAccount));

module.exports = router;
