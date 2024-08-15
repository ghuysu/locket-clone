"use strict";

const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const SignInKey = require("../models/signInKey");
const Feed = require("../models/feed.model");
const { Types } = require("mongoose");
const { emitEvent } = require("../utils/socketIO.util");
const {
  BadRequestError,
  InternalServerError,
} = require("../core/error.response");
const {
  getImageNameFromUrl,
  createImageFromFullname,
  deleteFile,
} = require("../utils/file.util");
const {
  uploadImageToAWSS3,
  deleteImageInAWSS3,
} = require("../utils/awsS3.util");
const {
  sendEmailToDeletedAccount,
  sendCodeForChangeEmail,
} = require("../utils/email.util");

class AccountService {
  static async removeInviteFromReceiver(errors, { userId }, { friendId }) {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Friend id is required");
    }

    const userIdObj = new Types.ObjectId(userId);
    const friendIdObj = new Types.ObjectId(friendId);

    // Kiểm tra xem bạn bè có tồn tại không
    const friend = await User.findById(friendIdObj);
    if (!friend) {
      throw new BadRequestError("Friend is not existing");
    }

    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(userIdObj);
    if (!user) {
      throw new InternalServerError("Something went wrong, try later");
    }

    // Kiểm tra xem họ đã là bạn chưa
    if (
      user.friendList.some((f) => f.equals(friendIdObj)) ||
      friend.friendList.some((f) => f.equals(userIdObj))
    ) {
      throw new BadRequestError("They are already friends");
    }

    // Kiểm tra xem người dùng có nhận lời mời không
    if (
      !user.receivedInviteList.some((f) => f.equals(friendIdObj)) ||
      !friend.sentInviteList.some((f) => f.equals(userIdObj))
    ) {
      throw new BadRequestError("User did not receive invite");
    }

    // Xóa bạn khỏi danh sách nhận lời mời của người dùng
    user.receivedInviteList = user.receivedInviteList.filter(
      (id) => !id.equals(friendIdObj)
    );

    // Xóa người dùng khỏi danh sách gửi lời mời của bạn
    friend.sentInviteList = friend.sentInviteList.filter(
      (id) => !id.equals(userIdObj)
    );

    // Lưu thay đổi
    await user.save();
    await friend.save();

    // Trả về người dùng đã được populate
    const populatedUser = await User.findById(userIdObj)
      .populate("friendList", "_id fullname profileImageUrl")
      .populate("receivedInviteList", "_id fullname profileImageUrl")
      .populate("sentInviteList", "_id fullname profileImageUrl")
      .lean();

    emitEvent("user", { userId: friendId, action: "friend" });

    return populatedUser;
  }

  static async removeInvite(errors, { userId }, { friendId }) {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Friend id is required");
    }

    const userIdObj = new Types.ObjectId(userId);
    const friendIdObj = new Types.ObjectId(friendId);

    // Kiểm tra xem bạn bè có tồn tại không
    const friend = await User.findById(friendIdObj);
    if (!friend) {
      throw new BadRequestError("Friend is not existing");
    }

    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(userIdObj);
    if (!user) {
      throw new InternalServerError("Something went wrong, try later");
    }

    // Kiểm tra xem họ đã là bạn chưa
    if (
      user.friendList.some((f) => f.equals(friendIdObj)) ||
      friend.friendList.some((f) => f.equals(userIdObj))
    ) {
      throw new BadRequestError("They are already friends");
    }

    // Kiểm tra xem người dùng có gửi lời mời không
    if (
      !user.sentInviteList.some((f) => f.equals(friendIdObj)) ||
      !friend.receivedInviteList.some((f) => f.equals(userIdObj))
    ) {
      throw new BadRequestError("User did not send invite");
    }

    // Xóa bạn khỏi danh sách gửi lời mời của người dùng
    user.sentInviteList = user.sentInviteList.filter(
      (f) => !f.equals(friendIdObj)
    );

    // Xóa người dùng khỏi danh sách nhận lời mời của bạn
    friend.receivedInviteList = friend.receivedInviteList.filter(
      (f) => !f.equals(userIdObj)
    );

    // Lưu thay đổi
    await user.save();
    await friend.save();

    // Trả về người dùng đã được populate
    const populatedUser = await User.findById(userIdObj)
      .populate("friendList", "_id fullname profileImageUrl")
      .populate("receivedInviteList", "_id fullname profileImageUrl")
      .populate("sentInviteList", "_id fullname profileImageUrl")
      .lean();

    emitEvent("user", { userId: friendId, action: "friend" });

    return populatedUser;
  }

  static async sendInvite(errors, { userId }, { friendId }) {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Friend id is required");
    }

    const userIdObj = new Types.ObjectId(userId);
    const friendIdObj = new Types.ObjectId(friendId);

    // Kiểm tra xem người bạn có tồn tại không
    const friend = await User.findById(friendIdObj);
    if (!friend) {
      throw new BadRequestError("Friend is not existing");
    }

    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(userIdObj);
    if (!user) {
      throw new InternalServerError("Something went wrong, try later");
    }

    // Kiểm tra xem hai người dùng đã là bạn bè chưa
    if (
      user.friendList.some((f) => f.equals(friendIdObj)) ||
      friend.friendList.some((f) => f.equals(userIdObj))
    ) {
      throw new BadRequestError("They are already friends");
    }

    // Kiểm tra xem người dùng đã gửi lời mời hay chưa
    if (
      user.sentInviteList.some((f) => f.equals(friendIdObj)) ||
      friend.receivedInviteList.some((f) => f.equals(userIdObj))
    ) {
      throw new BadRequestError("User sent invite before");
    }

    // Kiểm tra xem người bạn đã gửi lời mời chưa
    if (
      user.receivedInviteList.some((f) => f.equals(friendIdObj)) ||
      friend.sentInviteList.some((f) => f.equals(userId))
    ) {
      throw new BadRequestError("Friend sent invite before");
    }

    // Thêm người dùng vào danh sách lời mời nhận của bạn
    friend.receivedInviteList.push(user._id);

    // Thêm bạn vào danh sách lời mời gửi của người dùng
    user.sentInviteList.push(friend._id);

    // Lưu thay đổi vào cơ sở dữ liệu
    await user.save();
    await friend.save();

    emitEvent("user", { userId: friendId, action: "friend" });

    // Trả về người dùng đã được populate
    const populatedUser = await User.findById(userIdObj)
      .populate("friendList", "_id fullname profileImageUrl")
      .populate("receivedInviteList", "_id fullname profileImageUrl")
      .populate("sentInviteList", "_id fullname profileImageUrl")
      .lean();

    return populatedUser;
  }

  static async removeFriend(errors, { userId }, { friendId }) {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Friend id is required");
    }

    const userIdObj = new Types.ObjectId(userId);
    const friendIdObj = new Types.ObjectId(friendId);

    // Kiểm tra xem người bạn có tồn tại không
    const friend = await User.findById(friendIdObj);
    if (!friend) {
      throw new BadRequestError("Friend is not existing");
    }

    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(userIdObj);
    if (!user) {
      throw new InternalServerError("Something went wrong, try later");
    }

    // Kiểm tra xem họ có phải là bạn bè không
    if (
      !user.friendList.some((f) => f.equals(friendIdObj)) ||
      !friend.friendList.some((f) => f.equals(userIdObj))
    ) {
      throw new BadRequestError("They are not friends");
    }

    // Cập nhật danh sách bạn bè
    user.friendList = user.friendList.filter((f) => !f.equals(friendIdObj));
    friend.friendList = friend.friendList.filter((f) => !f.equals(userIdObj));

    // Lưu thay đổi vào cơ sở dữ liệu
    await user.save();
    await friend.save();

    // Trả về người dùng đã được populate
    const populatedUser = await User.findById(userIdObj)
      .populate("friendList", "_id fullname profileImageUrl")
      .populate("receivedInviteList", "_id fullname profileImageUrl")
      .populate("sentInviteList", "_id fullname profileImageUrl")
      .lean();

    emitEvent("user", { userId: friendId, action: "friend" });

    return populatedUser;
  }

  static async acceptFriend(errors, { userId }, { friendId }) {
    // Kiểm tra lỗi xác thực
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Friend id is required");
    }
    console.log(friendId);

    // Chuyển đổi friendId và userId thành ObjectId
    const friendIdObj = new Types.ObjectId(friendId);
    const userIdObj = new Types.ObjectId(userId);

    // Kiểm tra xem người bạn có tồn tại hay không
    const friend = await User.findById(friendIdObj);
    if (!friend) {
      throw new BadRequestError("Friend is not existing");
    }

    // Kiểm tra xem người dùng có tồn tại hay không
    const user = await User.findById(userIdObj);
    if (!user) {
      throw new InternalServerError("Something went wrong, try later");
    }

    // Kiểm tra xem hai người dùng đã là bạn bè chưa
    if (
      user.friendList.some((f) => f.equals(friendIdObj)) ||
      friend.friendList.some((f) => f.equals(userIdObj))
    ) {
      throw new BadRequestError("They are already friends");
    }

    // Kiểm tra xem người dùng có nhận lời mời không và bạn có gửi lời mời không
    if (
      !user.receivedInviteList.some((f) => f.equals(friendIdObj)) ||
      !friend.sentInviteList.some((f) => f.equals(userIdObj))
    ) {
      throw new BadRequestError("No invite found");
    }

    // Thêm bạn vào danh sách bạn bè của người dùng
    user.friendList.push(friendIdObj);

    // Thêm người dùng vào danh sách bạn bè của bạn
    friend.friendList.push(userIdObj);

    // Xóa lời mời
    user.receivedInviteList = user.receivedInviteList.filter(
      (f) => !f.equals(friendIdObj)
    );

    friend.sentInviteList = friend.sentInviteList.filter(
      (f) => !f.equals(userIdObj)
    );

    // Lưu thay đổi vào cơ sở dữ liệu
    await user.save();
    await friend.save();

    // Trả về đối tượng user đã được populate
    const populatedUser = await User.findById(userIdObj)
      .populate("friendList", "_id fullname profileImageUrl")
      .populate("receivedInviteList", "_id fullname profileImageUrl")
      .populate("sentInviteList", "_id fullname profileImageUrl")
      .lean() // Chuyển đổi kết quả thành đối tượng thuần túy
      .exec();

    emitEvent("user", {
      userList: [userId, friendId],
      action: "accept friend",
    });

    return populatedUser;
  }

  static async updateName(errors, { userId }, { lastname, firstname }) {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Firstname and lastname are required");
    }

    //update name
    const user = await User.findById(userId)
      .populate("friendList", "_id fullname profileImageUrl")
      .populate("sentInviteList", "_id fullname profileImageUrl")
      .populate("receivedInviteList", "_id fullname profileImageUrl");

    user.fullname.firstname = firstname;
    user.fullname.lastname = lastname;

    //delete current avatar
    const imageName = await getImageNameFromUrl(user.profileImageUrl);

    if (imageName.substring(0, 8) === "default_") {
      deleteImageInAWSS3(imageName);
      //create image from name
      const imagePath = await createImageFromFullname(lastname, firstname);
      //upload to s3
      const imageUrl = await uploadImageToAWSS3(imagePath);
      //delete image
      await deleteFile(imagePath);
      //update avatar url
      user.profileImageUrl = imageUrl;
    }

    await user.save();

    emitEvent("user", {
      userList: user.friendList.map((f) => f._id),
      action: "user",
    });

    return user;
  }

  static async updateBirthday(errors, { userId }, { birthday }) {
    if (!errors.isEmpty()) {
      throw new BadRequestError("Birthday is required");
    }
    const user = await User.findById(userId)
      .populate("friendList", "_id fullname profileImageUrl")
      .populate("sentInviteList", "_id fullname profileImageUrl")
      .populate("receivedInviteList", "_id fullname profileImageUrl");
    user.birthday = birthday;

    await user.save();
    emitEvent("user", {
      userList: user.friendList.map((f) => f._id),
      action: "user",
    });
    return user;
  }

  static async updateEmail(
    errors,
    { userId },
    { oldEmail, newEmail, password }
  ) {
    if (!errors.isEmpty()) {
      throw new BadRequestError("Infor is required");
    }

    const registeredUser = await User.findOne({
      email: oldEmail,
      _id: userId,
    }).lean();

    if (!registeredUser) {
      throw new BadRequestError("Old email is not registered");
    }

    // Check if the password is correct
    const match = await bcrypt.compare(password, registeredUser.password);

    if (!match) {
      throw new BadRequestError("Password is incorrect");
    }

    // Check new email is valid
    const user = await User.findOne({ email: newEmail }).lean();

    if (user) {
      throw new BadRequestError("Email is registered");
    }

    //send code to email to confirm user fill a existing email
    const code = await sendCodeForChangeEmail(newEmail);

    return {
      code: code,
    };
  }

  static async confirmChangeEmail(errors, { userId }, { email }) {
    if (!errors.isEmpty()) {
      throw new BadRequestError("No valid email found");
    }
    const user = await User.findById(userId)
      .populate("friendList", "_id fullname profileImageUrl")
      .populate("sentInviteList", "_id fullname profileImageUrl")
      .populate("receivedInviteList", "_id fullname profileImageUrl");
    user.email = email;

    await user.save();
    emitEvent("user", {
      userList: user.friendList.map((f) => f._id),
      action: "user",
    });

    return user;
  }

  static async updateProfileImage({ userId }, image) {
    //check image is existing or not
    if (!image) {
      throw new BadRequestError("No image found");
    }

    //get user
    const user = await User.findById(userId)
      .populate("friendList", "_id fullname profileImageUrl")
      .populate("sentInviteList", "_id fullname profileImageUrl")
      .populate("receivedInviteList", "_id fullname profileImageUrl");
    //delete current image
    await deleteImageInAWSS3(await getImageNameFromUrl(user.profileImageUrl));

    //update new image
    const imageUrl = await uploadImageToAWSS3(image.path, null);

    //delete image saved by multer
    deleteFile(image.path);

    //update url
    user.profileImageUrl = imageUrl;

    await user.save();
    emitEvent("user", {
      userList: user.friendList.map((f) => f._id),
      action: "user",
    });

    return user;
  }

  static async deleteAccount({ userId }) {
    // Find and delete the user
    const user = await User.findByIdAndDelete(userId).lean();

    if (!user) {
      throw new BadRequestError("No user found");
    }

    // Remove userId from friendList and receivedInviteList of other users using $or
    await User.updateMany(
      {
        $or: [{ "friendList.id": userId }, { "receivedInviteList.id": userId }],
      },
      {
        $pull: {
          friendList: { id: userId },
          receivedInviteList: { id: userId },
        },
      }
    );

    // Perform other tasks such as deleting image in S3, deleting sign-in keys, deleting feeds, and sending notification email
    await Promise.all([
      deleteImageInAWSS3(await getImageNameFromUrl(user.profileImageUrl)),
      SignInKey.deleteMany({ userId: userId }),
      Feed.deleteMany({ userId: userId }),
      sendEmailToDeletedAccount(user.email),
    ]);
    emitEvent("user", { userList: user.friendList, action: "user" });

    emitEvent("user", { userList: user.friendList, action: "user" });

    return null;
  }
}

module.exports = AccountService;
