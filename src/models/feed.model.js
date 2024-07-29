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
        required: true,
        index: true
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
    reactions: [reactionSchema],
    reactionStatistic: {
        like: {type: Number, default: 0},
        love: {type: Number, default: 0},
        haha: {type: Number, default: 0},
        wow: {type: Number, default: 0},
        sad: {type: Number, default: 0},
        angry: {type: Number, default: 0},
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        index: true }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, feedSchema)