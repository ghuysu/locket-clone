"use strict"

const {BadRequestError, InternalServerError} = require("../core/error.response")
const User = require("../models/user.model")
const {getImageNameFromUrl, createImageFromFullname, deleteFile} = require("../utils/file.util")
const {uploadImageToAWSS3, deleteImageInAWSS3} = require("../utils/awsS3.util")

class AccountService {
    static async removeFriend(errors, {userId}, {friendId}) {
        if (!errors.isEmpty()) {
            console.log(errors.array())
            throw new BadRequestError("Friend id is required")
        }
        //check friend is existing
        const friend = await User.findById(friendId).lean()
        if(!friend) {
            throw new BadRequestError("Friend is not existing")
        }
        //check they are friends or not
        const user = await User.findById(userId)
        if (!user) {
            throw new InternalServerError("Something wrong, try later");
        } 
        if (!user.friendList.some(f => f.id.toString() === friendId)){
            throw new BadRequestError("They are not friends")
        }
        //update friendList
        user.friendList = user.friendList.filter(f => f.id.toString() !== friendId)
        await user.save()
        return user
    }
    
    static async addFriend(errors, {userId}, {friendId}) {
        if (!errors.isEmpty()) {
            console.log(errors.array())
            throw new BadRequestError("Friend id is required")
        }
        //check friend is existing
        const friend = await User.findById(friendId).lean()
        if(!friend) {
            throw new BadRequestError("Friend is not existing")
        }
        //check they are friends or not
        const user = await User.findById(userId)
        if (!user) {
            throw new InternalServerError("Something wrong, try later");
        }    
        if (user.friendList.some(f => f.id.toString() === friendId)){
            throw new BadRequestError("They are already friends")
        }
        //add friend into friend list include _id, name, image url
        user.friendList.push({
            id: friend._id,
            name: {
                firstname: friend.fullname.firstname,
                lastname: friend.fullname.lastname
            },
            profileImageUrl: friend.profileImageUrl
        })
        await user.save()
        //return
        return user
    }

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

    static async updateProfileImage({userId}, image) {
        //check image is existing or not
        if(!image) {
            throw new BadRequestError("No image found")
        }
        //get user
        const user = await User.findById(userId)
        //delete current image
        await deleteImageInAWSS3(await getImageNameFromUrl(user.profileImageUrl))
        //update new image
        const imageUrl = await uploadImageToAWSS3(image.path, null)
        //delete image saved by multer
        deleteFile(image.path)
        //update url
        user.profileImageUrl = imageUrl
        await user.save()
        return user
    }

    static deleteAccount({}) {
        //check 
    }
}

module.exports = AccountService