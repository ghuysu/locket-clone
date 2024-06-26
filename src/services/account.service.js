"use strict"

const {BadRequestError} = require("../core/error.response")
const User = require("../models/user.model")

class AccountService {
    static async updateName(errors, {userId}, {lastname, firstname}) {
        if (!errors.isEmpty()) {
            throw new BadRequestError("Firstname and lastname are required")
        }
        const user = await User.findById(userId)
        user.fullname.firstname = firstname
        user.fullname.lastname = lastname
        await user.save()
        return user
    }

    static async updateBirthday(errors, {userId}, {birthday}) {
        if (!errors.isEmpty()) {
            throw new BadRequestError("Birthday is required")
        }
        const user = await User.findById(userId)
        user.birthday = birthday
        await user.save()
        return user
    }

    static async updateEmail(errors, {userId}, {email}) {
        if (!errors.isEmpty()) {
            throw new BadRequestError("No valid email found")
        }
        const user = await User.findById(userId)
        user.email = email
        await user.save()
        return user
    }

    static updateProfileImage({}) {
        //check req.file is existing or not
        //delete current image
        //update new image
        //update url
    }

    static deleteAccount({}) {
        //check 
    }
}

module.exports = AccountService