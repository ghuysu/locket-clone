"use strict"

const Feed = require("../models/feed.model")
const {BadRequestError} = require("../core/error.response")
const {deleteFile} = require("../utils/file.util")
const {uploadImageToAWSS3} = require("../utils/awsS3.util")
const {isValidObjectId} = require("../utils/objectId.util")

class FeedService {
    static createFeed = async (errors, {userId}, {description, visibility}, image) => {
        //check error
        if (!errors.isEmpty()) {
            throw new BadRequestError("Data is required")
        }
        if(visibility !== "everyone"){
            visibility = visibility.split(",").map(i => {
                i = i.trim()
                if(!isValidObjectId(i)){
                    throw new BadRequestError("Visibility is invalid")
                }
                return i
            })
        }
        //up image to s3
        const imageUrl = await uploadImageToAWSS3(image.path, null)
        //delete image
        await deleteFile(image.path)
        //create feed
        const feed = await Feed.create({
            userId: userId,
            description: description,
            imageUrl: imageUrl,
            visibility: visibility
        })
        if (!feed) {
            throw new BadRequestError("Something is wrong, try later")
        }
        return feed
    }

    static updateFeed = async (errors, {userId}, {feedId}, {description, visibility}) => {
        if (!errors.isEmpty()) {
            throw new BadRequestError("Data is required")
        }
        if(!isValidObjectId(feedId)){
            throw new BadRequestError("Feed id is invalid")
        }
        if(visibility !== "everyone"){
            visibility = visibility.split(",").map(i => {
                i = i.trim()
                if(!isValidObjectId(i)){
                    throw new BadRequestError("Visibility is invalid")
                }
                return i
            })
        }
        const feed = await Feed.findOne({_id: feedId, userId: userId}).lean()
        if(!feed) {
            throw new BadRequestError("No feed found")
        }

        const updatedFeed = await Feed.findOneAndUpdate(
            {_id: feedId, userId: userId},
            {
                $set: {
                    description: description,
                    visibility: visibility
                }
            },
            {new: true, runValidators: visibility, lean: true}
        )
        if (!updatedFeed) {
            throw new BadRequestError("Something is wrong, try later")
        }
        return updatedFeed
    }

    static deleteFeed = async () => {

    }
}

module.exports = FeedService