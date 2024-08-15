"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Message";
const COLLECTION_NAME = "Messages";

const messageSchema = new Schema(
  {
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiver: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    feedId: {
      type: Types.ObjectId,
      ref: "Feed",
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

messageSchema.index({ createdAt: -1 });

module.exports = model(DOCUMENT_NAME, messageSchema);
