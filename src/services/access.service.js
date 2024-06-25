"use strict"

const User = require("../models/user.model")
const {BadRequestError, } = require("../core/error.response")
const {sendCodeToCheckExistingEmail} = require("../utils/email.util")
require("dotenv").config()

class AccessService {
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