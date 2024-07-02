"use strict"

const Feed = require("../models/feed.model")
const User = require("../models/user.model")
const {BadRequestError} = require("../core/error.response")
const {deleteFile, getImageNameFromUrl} = require("../utils/file.util")
const {uploadImageToAWSS3, deleteImageInAWSS3} = require("../utils/awsS3.util")
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

    static deleteFeed = async ({userId}, {feedId}) => {
        if(!isValidObjectId(feedId)){
            throw new BadRequestError("Feed id is invalid")
        }
        //delete in db
        const feed = await Feed.findOneAndDelete({_id: feedId, userId: userId}).lean()
        if(!feed) {
            throw new BadRequestError("No feed found")
        }
        //delete image in s3
        await deleteImageInAWSS3(await getImageNameFromUrl(feed.imageUrl))
        return null
    }

    static getEveryoneFeed = async ({userId}, {page}) => {
        const ITEMS_PER_PAGE = 20
        if (!Number.isInteger(page)){
            page = 1
        }
        //get friend id list
        const user = await User.findById(userId).select("friendList").lean()
        const friendIdList = user.friendList.map(i => i.id.toString())
        const feeds = await Feed.find({
            $or: [
                {
                    //get friend feeds (feeds have userId field match friend id 
                    //and visibility is everyone or match userId)
                    userId: {$in: friendIdList},
                    $or: [
                        {visibility: 'everyone'},
                        {visibility: {$elemMatch: {$eq: userId}}}
                    ]
                },
                {
                    //get user's feeds
                    userId: userId
                }
            ]
        })
        .sort({createdAt: -1})
        .skip(ITEMS_PER_PAGE*(page-1))
        .limit(ITEMS_PER_PAGE)
        .lean()
        return feeds
    }   

    static getCertainFeed = async ({userId}, {searchId}, {page}) => {
        const ITEMS_PER_PAGE = 20
        if(!isValidObjectId(searchId)) {
            throw new BadRequestError("Search id is invalid")
        }
        if(!Number.isInteger(page)) {
            page = 1
        }
        //check search id is current userId or not
        //if not, check whether they are friend or not
        if(userId !== searchId){
            const user = await User.findById(userId).lean()
            const isFriend = user.friendList.some(i => i.id.toString() === searchId)
            if(!isFriend){
                throw new BadRequestError("They are not friends")
            }
        }
        const feeds = await Feed.find({
            $or: [
                {
                    userId: searchId,
                    $or: [
                        {visibility: 'everyone'},
                        {visibility: {$elemMatch: {$eq: userId}}}
                    ]
                },
                {
                    userId: userId
                }
            ]
            
        })
        .sort({createdAt: -1})
        .skip((page-1)*ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .lean()
        return feeds
    }
}

module.exports = FeedService