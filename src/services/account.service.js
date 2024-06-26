"use strict"

const {BadRequestError} = require("../core/error.response")
const User = require("../models/user.model")
const {getImageNameFromUrl, createImageFromFullname, deleteFile} = require("../utils/file.util")
const {uploadImageToAWSS3, deleteImageInAWSS3} = require("../utils/awsS3.util")

class AccountService {
    static async updateName(errors, {userId}, {lastname, firstname}) {
        if (!errors.isEmpty()) {
            console.log(errors.array())
            throw new BadRequestError("Firstname and lastname are required")
        }
        //update name
        const user = await User.findById(userId)
        user.fullname.firstname = firstname
        user.fullname.lastname = lastname
        //delete current avatar
        const imageName = await getImageNameFromUrl(user.profileImageUrl)
        if(imageName.substring(0, 8) === "default_") {
            deleteImageInAWSS3(imageName)
            //create image from name
            const imagePath = await createImageFromFullname(lastname, firstname)
            //upload to s3
            const imageUrl = await uploadImageToAWSS3(imagePath)
            //delete image
            await deleteFile(imagePath)
            //update avatar url
            user.profileImageUrl = imageUrl
        }
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