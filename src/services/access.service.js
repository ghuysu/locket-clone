"use strict"

const User = require("../models/user.model")
const {BadRequestError, } = require("../core/error.response")
const {sendCodeToCheckExistingEmail} = require("../utils/email.util")
const bcrypt = require("bcryptjs")
const {createImageFromFullname, deleteFile} = require("../utils/file.util")
const {uploadImageToAWSS3} = require("../utils/awsS3.util")
require("dotenv").config()

class AccessService {
    static signup = async (errors, { email, password, lastname, firstname, birthday}) => {
        if(!errors.isEmpty())
        {
            console.log(errors.array())
            throw new BadRequestError("Data is invalid")
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10)
        //create default profile image
        const imagePath = await createImageFromFullname(lastname, firstname)
        //upload to awss3 to get url
        const imageUrl = await uploadImageToAWSS3(imagePath)
        //delete image
        await deleteFile(imagePath)
        //create new account
        const newUser = User.create({
            email: email,
            password: hashedPassword,
            fullname: {
                lastname: lastname,
                firstname: firstname
            },
            birthday: birthday,
            profileImageUrl: imageUrl
        })
        //return new account
        if(newUser) {
            return newUser
        }
        else {
            throw new BadRequestError("Something is wrong, try again")
        }
    }

    static confirmValidEmail = async (errors, { email }) => {
        if(!errors.isEmpty())
        {
            console.log(errors.array())
            throw new BadRequestError("Email is invalid")
        }
        //check email is registered or not
        const registeredUser = await User.findOne({email}).lean()
        if(registeredUser){
            throw new BadRequestError("Email is registered")
        }
        //send code to email to confirm user fill a existing email
        const code = await sendCodeToCheckExistingEmail(email)
        return {
            "code": code,
        }
    }
}

module.exports = AccessService