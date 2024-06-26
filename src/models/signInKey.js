"use strict"

const {model, Schema} = require("mongoose")

const DOCUMENT_NAME = 'SigninKey'
const COLLECTION_NAME = 'SigninKeys'

const signinKeySchema = new Schema({
    userId: {
        ref: "User",
        type: Schema.Types.ObjectId,
        required: true
    },

    key: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, signinKeySchema)