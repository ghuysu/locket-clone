const Message = require("../models/message.model");
const User = require("../models/user.model");
const Feed = require("../models/feed.model");
const { emitEvent } = require("../utils/socketIO.util");
const { Types } = require("mongoose");
const { BadRequestError } = require("../core/error.response");

class MessageController {
  static sendMessage = async (
    { userId },
    { friendId },
    { message, feedId }
  ) => {
    //handle missing message
    if (!message) {
      throw new BadRequestError("Message is required");
    }

    //handle missing friendId
    if (!friendId) {
      throw new BadRequestError("Friend id is required");
    }

    //check if they are not friends
    const user = await User.findById(userId).lean();

    const isFriends = user.friendList.some((f) => f.toString() === friendId);

    if (!isFriends) {
      throw new BadRequestError("They are not friends");
    }

    //create and save message
    const messageData = {
      sender: new Types.ObjectId(userId),
      receiver: new Types.ObjectId(friendId),
      content: message,
    };

    let socketIoData = {};

    if (feedId) {
      const feed = await Feed.findOne({ _id: feedId, userId: friendId }).lean();

      if (!feed) {
        throw new BadRequestError("Feed is not existing");
      }

      let visible = false;

      if (
        Array.isArray(feed.visibility) &&
        feed.visibility.some((f) => f.toString() === userId)
      ) {
        visible = true;
      } else if (feed.visibility === "everyone") {
        visible = true;
      }

      if (!visible) {
        throw new BadRequestError("Feed is unavailable");
      } else {
        socketIoData.feed = feed;
      }

      messageData.feedId = new Types.ObjectId(feedId);
    }

    const newMessage = await Message.create(messageData);

    socketIoData.message = newMessage;
    console.log(socketIoData);

    //socket io for clients update
    emitEvent("message", {
      action: "sent",
      data: socketIoData,
    });

    //return new message
    return null;
  };

  static getMessages = async ({ userId }, { friendId }, { page }) => {
    const ITEMS_PER_PAGE = 20;

    //handle missing friendId
    if (!friendId) {
      throw new BadRequestError("Friend id is required");
    }

    //check if they are not friends
    const user = await User.findById(userId).lean();

    const isFriends = user.friendList.some((f) => f.toString() === friendId);

    if (!isFriends) {
      throw new BadRequestError("They are not friends");
    }

    //get all chat
    const messages = await Message.find({
      $or: [
        {
          sender: userId,
          receiver: friendId,
        },
        {
          sender: friendId,
          receiver: userId,
        },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate({
        path: "feedId",
        select: "_id imageUrl description",
      })
      .lean();

    //sort time ascending
    return messages.reverse();
  };
}

module.exports = MessageController;
