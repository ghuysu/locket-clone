const MessageService = require("../services/message.service");
const { OK } = require("../core/succes.response");

class MessageController {
  static sendMessage = async (req, res, next) => {
    new OK({
      message: "Sent message successfully",
      metadata: await MessageService.sendMessage(
        req.user,
        req.params,
        req.body
      ),
    }).send(res);
  };

  static getMessages = async (req, res, next) => {
    new OK({
      message: "Get messages successfully",
      metadata: await MessageService.getMessages(
        req.user,
        req.params,
        req.query
      ),
    }).send(res);
  };

  static getAllFriendMessages = async (req, res, next) => {
    new OK({
      message: "Get all friend messages successfully",
      metadata: await MessageService.getAllFriendMessages(req.user),
    }).send(res);
  };

  static readMessage = async (req, res, next) => {
    new OK({
      message: "Read messages successfully",
      metadata: await MessageService.readMessage(req.user, req.body),
    }).send(res);
  };
}

module.exports = MessageController;
