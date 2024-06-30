"use strict"

const {model, Schema, default: mongoose} = require("mongoose")

const DOCUMENT_NAME = "Feed"
const COLLECTION_NAME = "Feeds"

const reactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fullname: {
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        }
    },
    profileImageUrl: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true,
        enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry']
    }
}, { _id: false })

const feedSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    visibility: {
        type: Schema.Types.Mixed,
        required: true
    },
    reactions: [reactionSchema]
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

feedSchema.index({ userId: 1 });

module.exports = model(DOCUMENT_NAME, feedSchema)