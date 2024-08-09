"use strict";

const Feed = require("../models/feed.model");
const User = require("../models/user.model");
const { BadRequestError } = require("../core/error.response");
const { deleteFile, getImageNameFromUrl } = require("../utils/file.util");
const { isValidObjectId } = require("../utils/objectId.util");
const { Types } = require("mongoose");
const { emitEvent } = require("../utils/socketIO.util");
const {
  uploadImageToAWSS3,
  deleteImageInAWSS3,
} = require("../utils/awsS3.util");

class FeedService {
  static createFeed = async (
    errors,
    { userId },
    { description, visibility },
    image
  ) => {
    //check error
    if (!errors.isEmpty()) {
      throw new BadRequestError("Data is required");
    }

    if (visibility !== "everyone") {
      visibility = visibility.split(",").map((i) => {
        i = i.trim();
        if (!isValidObjectId(i)) {
          throw new BadRequestError("Visibility is invalid");
        }
        return i;
      });
    }

    //up image to s3
    const imageUrl = await uploadImageToAWSS3(image.path, null);

    //delete image
    await deleteFile(image.path);

    //create feed
    const feed = await Feed.create({
      userId: userId,
      description: description,
      imageUrl: imageUrl,
      visibility: visibility,
    });

    if (!feed) {
      throw new BadRequestError("Something is wrong, try later");
    }

    return feed;
  };

  static updateFeed = async (
    errors,
    { userId },
    { feedId },
    { description, visibility }
  ) => {
    if (!errors.isEmpty()) {
      throw new BadRequestError("Data is required");
    }

    if (!isValidObjectId(feedId)) {
      throw new BadRequestError("Feed id is invalid");
    }

    if (visibility !== "everyone") {
      visibility = visibility.split(",").map((i) => {
        i = i.trim();
        if (!isValidObjectId(i) && i !== "everyone") {
          throw new BadRequestError("Visibility is invalid");
        }
        return i;
      });
    }

    // Kiểm tra sự tồn tại của feed
    const feed = await Feed.findOne({ _id: feedId, userId: userId }).lean();

    if (!feed) {
      throw new BadRequestError("No feed found");
    }

    // Cập nhật feed
    const updatedFeed = await Feed.findOneAndUpdate(
      { _id: feedId, userId: userId },
      {
        $set: {
          description: description,
          visibility: visibility,
        },
      },
      { new: true, runValidators: true } // Chỉnh sửa runValidators và không dùng lean ở đây
    )
      .populate("userId", "fullname profileImageUrl")
      .populate({
        path: "reactions.userId", // Populate userId in reactions
        select: "_id profileImageUrl fullname", // Các trường từ User bạn muốn populate trong reactions
      })
      .lean(); // Thực hiện populate và chuyển đổi về dạng đối tượng JavaScript đơn giản

    if (!updatedFeed) {
      throw new InternalServerError("Something went wrong, try later");
    }

    emitEvent("feed", { action: "update", feed: updatedFeed });

    return updatedFeed;
  };

  static deleteFeed = async ({ userId }, { feedId }) => {
    if (!isValidObjectId(feedId)) {
      throw new BadRequestError("Feed id is invalid");
    }

    //delete in db
    const feed = await Feed.findOneAndDelete({
      _id: feedId,
      userId: userId,
    }).lean();

    if (!feed) {
      throw new BadRequestError("No feed found");
    }

    //delete image in s3
    await deleteImageInAWSS3(await getImageNameFromUrl(feed.imageUrl));

    return null;
  };

  static getEveryoneFeed = async ({ userId }, { page }) => {
    const ITEMS_PER_PAGE = 20;

    const user = await User.findById(userId).select("friendList").lean();
    
    const feeds = await Feed.find({
      $or: [
        {
          // get friend feeds (feeds have userId field match friend id
          // and visibility is everyone or match userId)
          userId: { $in: user.friendList },
          $or: [
            { visibility: "everyone" },
            { visibility: { $elemMatch: { $eq: userId } } },
          ],
        },
        {
          // get user's feeds
          userId: userId,
        },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(ITEMS_PER_PAGE * (page - 1))
      .limit(ITEMS_PER_PAGE)
      .populate("userId", "fullname profileImageUrl") // Sử dụng populate để lấy thêm thông tin user
      .populate({
        path: "reactions.userId", // Populate userId in reactions
        select: "_id profileImageUrl fullname", // Các trường từ User bạn muốn populate trong reactions
      })
      .lean();

    return feeds;
  };

  static getCertainFeed = async ({ userId }, { searchId }, { page }) => {
    const ITEMS_PER_PAGE = 20;

    if (!isValidObjectId(searchId)) {
      throw new BadRequestError("Search id is invalid");
    }
    //check search id is current userId or not
    //if not, check whether they are friend or not
    if (userId !== searchId) {
      const user = await User.findById(userId).lean();
      const isFriend = user.friendList.some((i) => i.toString() === searchId);
      if (!isFriend) {
        throw new BadRequestError("They are not friends");
      }
      const feeds = await Feed.find({
        userId: searchId,
        $or: [
          { visibility: "everyone" },
          { visibility: { $elemMatch: { $eq: userId } } },
        ],
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .populate("userId", "fullname profileImageUrl") // Sử dụng populate để lấy thêm thông tin user
        .populate({
          path: "reactions.userId", // Populate userId in reactions
          select: "_id profileImageUrl fullname", // Các trường từ User bạn muốn populate trong reactions
        })
        .lean();
      return feeds;
    }
    
    if (userId === searchId) {
      const feeds = await Feed.find({
        userId: userId,
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .populate("userId", "fullname profileImageUrl") // Sử dụng populate để lấy thêm thông tin user
        .populate({
          path: "reactions.userId", // Populate userId in reactions
          select: "_id profileImageUrl fullname", // Các trường từ User bạn muốn populate trong reactions
        })
        .lean();

      return feeds;
    }
  };

  static reactFeed = async (errors, { userId }, { feedId }, { icon }) => {
    // Kiểm tra lỗi xác thực
    if (!errors.isEmpty()) {
      throw new BadRequestError("Icon is required");
    }

    // Kiểm tra xem biểu tượng có hợp lệ không
    const reactIcons = ["like", "love", "haha", "wow", "sad", "angry"];

    if (!reactIcons.includes(icon)) {
      throw new BadRequestError("Icon is invalid");
    }

    // Kiểm tra ID của feed có hợp lệ không
    if (!isValidObjectId(feedId)) {
      throw new BadRequestError("Feed id is invalid");
    }

    // Tìm feed theo ID
    let feed = await Feed.findById(feedId);

    if (!feed) {
      throw new BadRequestError("Feed is not existing");
    }

    // Kiểm tra xem người dùng có đang phản ứng với feed của chính họ không
    if (feed.userId.toString() === userId) {
      throw new BadRequestError("Cannot react to your own feed");
    }

    //Kiểm tra feed có hiện đối với user hiện tại k
    if (!feed.visibility.includes(userId)) {
      throw new BadRequestError("This feed did not shown for you anymore");
    }

    // Kiểm tra người dùng có phản ứng trước đó không
    const existingReaction = feed.reactions.find(
      (reaction) => reaction.userId.toString() === userId
    );

    if (existingReaction) {
      // Kiểm tra icon hiện tại có giống lúc trước không, nếu giống thì xoá reaction đó
      if (icon === existingReaction.icon) {
        feed.reactionStatistic[existingReaction.icon] -= 1;

        feed.reactions = feed.reactions.filter((reaction) => {
          reaction.userId !== userId;
        });
      } else {
        // Nếu đã có phản ứng, cập nhật phản ứng
        feed.reactionStatistic[existingReaction.icon] -= 1; // Giảm số lượng phản ứng cũ

        feed.reactionStatistic[icon] += 1; // Tăng số lượng phản ứng mới

        feed.reactions.map((reaction) => {
          if (reaction.userId.toString() === userId.toString())
            reaction.icon = icon;
          return reaction;
        });
      }
    } else {
      // Nếu chưa có phản ứng, thêm mới
      feed.reactions.push({
        userId: userId,
        icon: icon,
      });
<<<<<<< HEAD

=======
>>>>>>> c73592cc4e70d17ceb6bd8d393ddfa5917581600
      feed.reactionStatistic[icon] += 1; // Tăng số lượng phản ứng mới
    }

    // Lưu thay đổi vào cơ sở dữ liệu
    await feed.save();

    // Trả về feed đã cập nhật
    return await Feed.findById(feedId)
      .populate({
        path: "userId", // Populate thông tin người dùng
        select: "_id profileImageUrl fullname",
      })
      .populate({
        path: "reactions.userId", // Populate thông tin người dùng trong reactions
        select: "_id profileImageUrl fullname",
      })
      .lean(); // Chuyển đổi kết quả thành đối tượng JavaScript đơn giản
  };
}

module.exports = FeedService;
