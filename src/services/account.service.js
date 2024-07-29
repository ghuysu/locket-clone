"use strict";

const {
  BadRequestError,
  InternalServerError,
} = require("../core/error.response");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const SignInKey = require("../models/signInKey");
const Feed = require("../models/feed.model");
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
    //check friend is existing
    const friend = await User.findById(friendId);
    if (!friend) {
      throw new BadRequestError("Friend is not existing");
    }
    //check they are already friends or not
    const user = await User.findById(userId);
    if (!user) {
      throw new InternalServerError("Something wrong, try later");
    }
    if (
      user.friendList.some((f) => f.id.toString() === friendId) ||
      friend.friendList.some((f) => f.id.toString() === userId)
    ) {
      throw new BadRequestError("They are already friends");
    }
    //check user received invite or not
    if (
      !user.receivedInviteList.some((f) => f.id.toString() === friendId) ||
      !friend.sentInviteList.some((f) => f.id.toString() === userId)
    ) {
      throw new BadRequestError("User did not receive invite");
    }
    //delete friend out of user received list
    user.receivedInviteList = user.receivedInviteList.filter(
      (f) => f.id.toString() !== friendId
    );
    //delete user out of friend sent list
    friend.sentInviteList = friend.sentInviteList.filter(
      (f) => f.id.toString() !== userId
    );
    //return
    await user.save();
    await friend.save();
    return user;
  }

  static async removeInvite(errors, { userId }, { friendId }) {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Friend id is required");
    }
    //check friend is existing
    const friend = await User.findById(friendId);
    if (!friend) {
      throw new BadRequestError("Friend is not existing");
    }
    //check they are already friends or not
    const user = await User.findById(userId);
    if (!user) {
      throw new InternalServerError("Something wrong, try later");
    }
    if (
      user.friendList.some((f) => f.id.toString() === friendId) ||
      friend.friendList.some((f) => f.id.toString() === userId)
    ) {
      throw new BadRequestError("They are already friends");
    }
    //check user sent invite or not
    if (
      !user.sentInviteList.some((f) => f.id.toString() === friendId) ||
      !friend.receivedInviteList.some((f) => f.id.toString() === userId)
    ) {
      throw new BadRequestError("User did not send invite");
    }
    //delete friend from user sent friend list
    user.sentInviteList = user.sentInviteList.filter(
      (f) => f.id.toString() !== friendId
    );
    //delete user from friend received friend list
    friend.receivedInviteList = friend.receivedInviteList.filter(
      (f) => f.id.toString() !== userId
    );
    //return
    await user.save();
    await friend.save();
    return user;
  }

  static async sendInvite(errors, { userId }, { friendId }) {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Friend id is required");
    }
    //check friend is existing
    const friend = await User.findById(friendId);
    if (!friend) {
      throw new BadRequestError("Friend is not existing");
    }
    //check they are already friends or not
    const user = await User.findById(userId);
    if (!user) {
      throw new InternalServerError("Something wrong, try later");
    }
    if (
      user.friendList.some((f) => f.id.toString() === friendId) ||
      friend.friendList.some((f) => f.id.toString() === userId)
    ) {
      throw new BadRequestError("They are already friends");
    }
    //check user already send invite or not
    if (
      user.sentInviteList.some((f) => f.id.toString() === friendId) ||
      friend.receivedInviteList.some((f) => f.id.toString() === userId)
    ) {
      throw new BadRequestError("User sent invite before");
    }
    //check friend sent invite or not
    if (
      user.receivedInviteList.some((f) => f.id.toString() === friendId) ||
      friend.sentInviteList.some((f) => f.id.toString() === userId)
    ) {
      throw new BadRequestError("Friend sent invite before");
    }
    //add friend into user received invite list
    friend.receivedInviteList.push({
      id: user._id,
      name: {
        firstname: user.fullname.firstname,
        lastname: user.fullname.lastname,
      },
      profileImageUrl: user.profileImageUrl,
    });
    //add user into friend sent invite list
    user.sentInviteList.push({
      id: friend._id,
      name: {
        firstname: friend.fullname.firstname,
        lastname: friend.fullname.lastname,
      },
      profileImageUrl: friend.profileImageUrl,
    });
    await user.save();
    await friend.save();
    return user;
  }

  static async removeFriend(errors, { userId }, { friendId }) {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Friend id is required");
    }
    //check friend is existing
    const friend = await User.findById(friendId);
    if (!friend) {
      throw new BadRequestError("Friend is not existing");
    }
    //check they are friends or not
    const user = await User.findById(userId);
    if (!user) {
      throw new InternalServerError("Something wrong, try later");
    }
    if (
      !user.friendList.some((f) => f.id.toString() === friendId) ||
      !friend.friendList.some((f) => f.id.toString() === userId)
    ) {
      throw new BadRequestError("They are not friends");
    }
    //update friendList
    user.friendList = user.friendList.filter(
      (f) => f.id.toString() !== friendId
    );
    friend.friendList = friend.friendList.filter(
      (f) => f.id.toString() !== userId
    );
    await user.save();
    await friend.save();
    return user;
  }

  static async acceptFriend(errors, { userId }, { friendId }) {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Friend id is required");
    }
    //check friend is existing
    const friend = await User.findById(friendId);
    if (!friend) {
      throw new BadRequestError("Friend is not existing");
    }
    //check they are friends or not
    const user = await User.findById(userId);
    if (!user) {
      throw new InternalServerError("Something wrong, try later");
    }
    if (
      user.friendList.some((f) => f.id.toString() === friendId) ||
      friend.friendList.some((f) => f.id.toString() === userId)
    ) {
      throw new BadRequestError("They are already friends");
    }
    //check received invite or not
    console.log(
      !user.receivedInviteList.some((f) => f.id.toString() === friendId)
    );
    console.log(!friend.sentInviteList.some((f) => f.id.toString() === userId));
    console.log(
      !user.receivedInviteList.some((f) => f.id.toString() === friendId) ||
        !friend.sentInviteList.some((f) => f.id.toString === userId)
    );
    if (
      !user.receivedInviteList.some((f) => f.id.toString() === friendId) ||
      !friend.sentInviteList.some((f) => f.id.toString() === userId)
    ) {
      throw new BadRequestError("No invite found");
    }
    //add friend into friend list include _id, name, image url each other
    user.friendList.push({
      id: friend._id,
      name: {
        firstname: friend.fullname.firstname,
        lastname: friend.fullname.lastname,
      },
      profileImageUrl: friend.profileImageUrl,
    });
    friend.friendList.push({
      id: user._id,
      name: {
        firstname: user.fullname.firstname,
        lastname: user.fullname.lastname,
      },
      profileImageUrl: user.profileImageUrl,
    });
    //remove invite
    user.receivedInviteList = user.receivedInviteList.filter(
      (f) => f.id.toString() !== friendId
    );
    friend.sentInviteList = friend.sentInviteList.filter(
      (f) => f.id.toString() !== userId
    );
    await user.save();
    await friend.save();
    //return
    return user;
  }

  static async updateName(errors, { userId }, { lastname, firstname }) {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Firstname and lastname are required");
    }
    //update name
    const user = await User.findById(userId);
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
    return user;
  }

  static async updateBirthday(errors, { userId }, { birthday }) {
    if (!errors.isEmpty()) {
      throw new BadRequestError("Birthday is required");
    }
    const user = await User.findById(userId);
    user.birthday = birthday;
    await user.save();
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
    const user = await User.findById(userId);
    user.email = email;
    await user.save();
    return user;
  }

  static async updateProfileImage({ userId }, image) {
    //check image is existing or not
    if (!image) {
      throw new BadRequestError("No image found");
    }
    //get user
    const user = await User.findById(userId);
    //delete current image
    await deleteImageInAWSS3(await getImageNameFromUrl(user.profileImageUrl));
    //update new image
    const imageUrl = await uploadImageToAWSS3(image.path, null);
    //delete image saved by multer
    deleteFile(image.path);
    //update url
    user.profileImageUrl = imageUrl;
    await user.save();
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

    return null;
  }
}

module.exports = AccountService;
