const router = require("express").Router();
const asyncHandler = require("../helpers/asyncHandler.helper");
const MessageController = require("../controllers/message.controller");
const { authenticateToken } = require("../auth/loginKey.auth");

//check authentication key
router.use(asyncHandler(authenticateToken));

//send a message
router.post("/:friendId", asyncHandler(MessageController.sendMessage));

//get messages
router.get("/certain/:friendId", asyncHandler(MessageController.getMessages));

//get all-friend messages
router.get("/all", asyncHandler(MessageController.getAllFriendMessages));

//read message
router.patch("/read", asyncHandler(MessageController.readMessage));

module.exports = router;
