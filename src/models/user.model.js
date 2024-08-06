"use strict";

const { Schema, model, Types } = require("mongoose");

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";

var userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    fullname: {
      firstname: {
        type: String,
        required: true,
      },
      lastname: {
        type: String,
        required: true,
      },
    },
    birthday: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      required: true,
    },
    friendList: [
      {
        type: Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    receivedInviteList: [
      {
        type: Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    sentInviteList: [
      {
        type: Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, userSchema);
