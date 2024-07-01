"use strict"

const User = require("../models/user.model")
const {BadRequestError} = require("../core/error.response")
const {isValidObjectId} = require("../utils/objectId.util")

class SearchService {
    static searchUser  = async (errors, { userId }, { searchValue }) => {
        if (!errors.isEmpty()) {
            throw new BadRequestError("Search value is required")
        }
        //ex: "To Uyen Dang" -> /To|Uyen|Dang/i
        // /.../ : regular expression
        // | : or
        // i : flag case insensitive (don't wonder uppercase or lowercase)
        const searchRegex = new RegExp(searchValue.replace(/\s+/g, '|'), 'i');
        const users = await User.find({
            _id: { $ne: userId },
            $or: [
                { 'fullname.firstname': searchRegex },
                { 'fullname.lastname': searchRegex }
            ]
        }).select('_id fullname profileImageUrl').lean();
        return users
    }

    static getUserInfor = async ({userId}, {searchId}) => {
        if(isValidObjectId(id)) {
            throw new BadRequestError("Search id is invalid")
        }
        const user = await User.findById(searchId).lean()
        if(!user) {
            throw new BadRequestError("No user found")
        }
        return user
    }
}

module.exports = SearchService