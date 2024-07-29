"use strict";

const User = require("../models/user.model");
const { BadRequestError } = require("../core/error.response");
const { isValidObjectId } = require("../utils/objectId.util");

class SearchService {
  static searchUser = async ({ userId }, { searchValue }) => {
    if (!searchValue) {
      throw new BadRequestError("Search value is required");
    }
    //ex: "To Uyen Dang" -> /To|Uyen|Dang/i
    // /.../ : regular expression
    // | : or
    // i : flag case insensitive (don't wonder uppercase or lowercase)
    console.log(searchValue);
    const searchRegex = new RegExp(searchValue.replace(/\s+/g, "|"), "i");
    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { "fullname.firstname": searchRegex },
        { "fullname.lastname": searchRegex },
      ],
    })
      .select("_id fullname profileImageUrl email birthday")
      .lean();
    return users;
  };

  static getUserInfor = async ({ userId }, { searchId }) => {
    if (!isValidObjectId(searchId)) {
      throw new BadRequestError("Search id is invalid");
    }
    let user;
    if (userId === searchId) {
      user = await User.findById(searchId).lean();
    } else {
      user = await User.findById(searchId)
        .select("_id fullname email birthday profileImageUrl")
        .lean();
    }
    if (!user) {
      throw new BadRequestError("No user found");
    }
    return user;
  };
}

module.exports = SearchService;
