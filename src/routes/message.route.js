const router = require("express").Router();
const asyncHandler = require("../helpers/asyncHandler.helper");
const MessageController = require("../controllers/message.controller");
const { authenticateToken } = require("../auth/loginKey.auth");

//check authentication key
router.use(asyncHandler(authenticateToken));

//send message
router.post("/:friendId", asyncHandler(MessageController.sendMessage));

//get message
router.get("/:friendId", asyncHandler(MessageController.getMessages));

module.exports = router;
