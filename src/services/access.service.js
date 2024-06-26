"use strict"

const User = require("../models/user.model")
const SignInKey = require("../models/signInKey")
const {BadRequestError, } = require("../core/error.response")
const {sendCodeToCheckExistingEmail} = require("../utils/email.util")
const bcrypt = require("bcryptjs")
const {createImageFromFullname, deleteFile} = require("../utils/file.util")
const {uploadImageToAWSS3} = require("../utils/awsS3.util")
const jwt = require("jsonwebtoken")
require("dotenv").config()

class AccessService {
    static signout = async ({userId}) => {
        await SignInKey.deleteOne({userId: userId})
        return null;
    }

    static signin = async (errors, {email, password}) => {
        if(!errors.isEmpty())
        {
            console.log(errors.array())
            throw new BadRequestError("Data is required")
        }
        //Check email is registered or not
        const registeredUser = await User.findOne({email: email}).lean()
        if (!registeredUser) {
            throw new BadRequestError("Email is not registered")
        }
        //Check password is correct or not
        const match = await bcrypt.compare(password, registeredUser.password)
        if (!match) {
            throw new BadRequestError("Password is incorrect")
        }
        //Create signin key
        const signInKey =  jwt.sign(
            {userId: registeredUser._id, email: registeredUser.email},
            process.env.JWT_SECRET_KEY,
            {expiresIn: "7d"}
        )
        //Save signin key
        const newSignInKey = await SignInKey.create({
            userId: registeredUser._id,
            key: signInKey
        })
        if (!newSignInKey) {
            throw new BadRequestError("Something is wrong, try again")
        }
        //Return
        return {
            user: registeredUser,
            signInKey: signInKey
        }
    }

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