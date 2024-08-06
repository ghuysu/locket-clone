"use strict";

const FeedController = require("../controllers/feed.controller");
const router = require("express").Router();
const asyncHandler = require("../helpers/asyncHandler.helper");
const { authenticateToken } = require("../auth/loginKey.auth");
const { uploadImage } = require("../configs/multer.config");
const { body } = require("express-validator");

router.use(asyncHandler(authenticateToken));

router.post(
  "/create",
  uploadImage.single("image"),
  [body("visibility").not().isEmpty().withMessage("Visibility is required")],
  asyncHandler(FeedController.createFeed)
);

router.patch(
  "/:feedId",
  [body("visibility").not().isEmpty().withMessage("Visibility is required")],
  asyncHandler(FeedController.updateFeed)
);

router.delete("/:feedId", asyncHandler(FeedController.deleteFeed));

router.get("/everyone", asyncHandler(FeedController.getEveryoneFeed));

router.get("/certain/:searchId", asyncHandler(FeedController.getCertainFeed));

router.post(
  "/:feedId",
  [body("icon").not().isEmpty().withMessage("Icon is required")],
  asyncHandler(FeedController.reactFeed)
);

module.exports = router;
