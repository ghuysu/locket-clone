const Message = require("../models/message.model");
const User = require("../models/user.model");
const Feed = require("../models/feed.model");
const { emitEvent } = require("../utils/socketIO.util");
const { Types } = require("mongoose");
const { BadRequestError } = require("../core/error.response");

class MessageService {
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
      }

      messageData.feedId = new Types.ObjectId(feedId);
    }

    const newMessage = await Message.create(messageData);

    // Populate các trường sau khi đã tạo và lưu message
    const populatedMessage = await Message.findById(newMessage._id)
      .populate({
        path: "feedId",
        select: "_id imageUrl description",
      })
      .populate({
        path: "sender",
        select: "_id fullname profileImageUrl",
      })
      .populate({
        path: "receiver",
        select: "_id fullname profileImageUrl",
      })
      .lean(); // Sử dụng lean để lấy dữ liệu dưới dạng plain object

    // Cập nhật dữ liệu cho socket.io
    const socketIoData = {
      message: populatedMessage,
      senderId: userId,
      receiverId: friendId,
    };
    console.log(populatedMessage);

    emitEvent("message", {
      action: "sent",
      data: socketIoData,
    });

    // Trả về message mới đã populate
    return populatedMessage;
  };

  static readMessage = async ({ userId }, { messageIds }) => {
    console.log(messageIds);
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      throw new BadRequestError("Valid message ids are required");
    }

    const result = await Message.updateMany(
      {
        _id: { $in: messageIds },
        receiver: userId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );
    console.log(result);

    if (result.modifiedCount === 0) {
      throw new BadRequestError("No unread messages found for the user");
    }

    return null;
  };

  static getMessages = async ({ userId }, { friendId }, { skip }) => {
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
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .populate({
        path: "feedId",
      })
      .populate({
        path: "sender",
        select: "_id fullname profileImageUrl",
      })
      .populate({
        path: "receiver",
        select: "_id fullname profileImageUrl",
      })
      .lean();

    //sort time ascending
    return messages.reverse();
  };

  static getAllFriendMessages = async ({ userId }) => {
    const ITEMS_PER_PAGE = 20;

    // Lấy thông tin người dùng và danh sách bạn bè
    const user = await User.findById(userId)
      .populate({
        path: "friendList",
        select: "_id profileImageUrl fullname",
      })
      .lean();

    const friendList = user.friendList;
    console.log(friendList);

    const allMessages = [];

    // Lặp qua từng bạn bè trong danh sách bạn bè
    for (const friend of friendList) {
      const messages = await Message.find({
        $or: [
          {
            sender: userId,
            receiver: friend._id,
          },
          {
            sender: friend._id,
            receiver: userId,
          },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(0)
        .limit(ITEMS_PER_PAGE)
        .populate({
          path: "feedId",
        })
        .populate({
          path: "sender",
          select: "_id fullname profileImageUrl",
        })
        .populate({
          path: "receiver",
          select: "_id fullname profileImageUrl",
        })
        .lean();

      // Đảo ngược tin nhắn để sắp xếp theo thời gian tăng dần
      allMessages.push({
        friendId: friend._id,
        friendImageUrl: friend.profileImageUrl,
        friendFullname: friend.fullname,
        messages: messages.reverse(),
      });
    }

    return allMessages;
  };
}

module.exports = MessageService;
