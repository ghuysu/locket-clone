"use strict";

const User = require("../models/user.model");
const SignInKey = require("../models/signInKey");
const { BadRequestError } = require("../core/error.response");
const {
  sendCodeToCheckExistingEmail,
  sendCodeToCheckOwner,
} = require("../utils/email.util");
const bcrypt = require("bcryptjs");
const { createImageFromFullname, deleteFile } = require("../utils/file.util");
const { uploadImageToAWSS3 } = require("../utils/awsS3.util");
const jwt = require("jsonwebtoken");
const { validatePassword } = require("../utils/password.util");
require("dotenv").config();

class AccessService {
  static changePassword = async (errors, { email, password }) => {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Email and password are required");
    }
    if (!validatePassword(password)) {
      throw new BadRequestError("New password does not meet requirements");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new BadRequestError("User not found");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    return await User.findById(user._id).lean();
  };

  static signout = async ({ userId }) => {
    await SignInKey.deleteOne({ userId: userId });
    return null;
  };

  static signin = async (errors, { email, password }) => {
    // Check for validation errors
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Data is required");
    }

    // Check if the email is registered
    const registeredUser = await User.findOne({ email: email })
      .populate("friendList", "_id fullname profileImageUrl")
      .populate("sentInviteList", "_id fullname profileImageUrl")
      .populate("receivedInviteList", "_id fullname profileImageUrl")
      .lean();

    if (!registeredUser) {
      throw new BadRequestError("Email is not registered");
    }

    // Check if the password is correct
    const match = await bcrypt.compare(password, registeredUser.password);
    if (!match) {
      throw new BadRequestError("Password is incorrect");
    }

    // Create a new sign-in key
    const expiresIn = 7; // Number of days the sign-in key is valid
    const signInKey = jwt.sign(
      { userId: registeredUser._id, email: registeredUser.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: `${expiresIn}d` }
    );

    // Calculate the expiry date
    const expiryDay = new Date();
    expiryDay.setDate(expiryDay.getDate() + expiresIn);

    // Save the new sign-in key
    const newSignInKey = await SignInKey.create({
      userId: registeredUser._id,
      key: signInKey,
    });
    if (!newSignInKey) {
      throw new BadRequestError("Something is wrong, try again");
    }

    // Return user information, sign-in key, and expiry date
    return {
      user: registeredUser,
      signInKey: signInKey,
      expiryDay: expiryDay.toISOString(), // Convert the expiry date to an ISO string
    };
  };

  static signup = async (
    errors,
    { email, password, lastname, firstname, birthday }
  ) => {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Data is invalid");
    }
    if (!validatePassword(password)) {
      throw new BadRequestError("New password does not meet requirements");
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //create default profile image
    const imagePath = await createImageFromFullname(lastname, firstname);
    //upload to awss3 to get url
    const imageUrl = await uploadImageToAWSS3(imagePath);
    //delete image
    await deleteFile(imagePath);
    //create new account
    const newUser = User.create({
      email: email,
      password: hashedPassword,
      fullname: {
        lastname: lastname,
        firstname: firstname,
      },
      birthday: birthday,
      profileImageUrl: imageUrl,
    });
    //return new account
    if (newUser) {
      return newUser;
    } else {
      throw new BadRequestError("Something is wrong, try again");
    }
  };

  static confirmValidEmail = async (errors, { email }) => {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Email is invalid");
    }
    //check email is registered or not
    const registeredUser = await User.findOne({ email }).lean();
    if (registeredUser) {
      throw new BadRequestError("Email is registered");
    }
    //send code to email to confirm user fill a existing email
    const code = await sendCodeToCheckExistingEmail(email);
    return {
      code: code,
    };
  };

  static confirmOwner = async (errors, { email }) => {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      throw new BadRequestError("Email is invalid");
    }
    //check email is registered or not
    const user = await User.findOne({ email }).lean();
    if (!user) {
      throw new BadRequestError("Email is not registered");
    }
    //send code to email to confirm user fill a existing email
    const code = await sendCodeToCheckOwner(email);
    return {
      code: code,
    };
  };
}

module.exports = AccessService;
