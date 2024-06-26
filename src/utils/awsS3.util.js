const AWS = require('aws-sdk')
const fs = require("fs");
const {InternalServerError} = require("../core/error.response")
require("dotenv").config()


AWS.config.update({
    accessKeyId: process.env.AWSS3_ACCESS_KEY,
    secretAccessKey: process.env.AWSS3_SECRET_ACCESS_KEY,
    region: process.env.AWSS3_REGION
});

const s3 = new AWS.S3();

const uploadImageToAWSS3 = async (imagePath, type='default') => {
    //load imagebuffer from imagePath
    const imageBuffer = await fs.promises.readFile(imagePath);
    //get imageName from path
    let imageName = imagePath.split('/')
    imageName = imageName[imageName.length-1]
    if (type == 'default'){
      imageName = `${type}_${imageName}`
    }
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: imageName,
        Body: imageBuffer,
        ContentType: 'image/*'
    };
    try {
        const data = await s3.upload(params).promise();
        console.log('::Image uploaded successfully:', data.Location);
        return data.Location;
    } catch (err) {
        throw err;
    }
};

const deleteImageInAWSS3 = async (imageName) => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: imageName
    };
    try {
        await s3.deleteObject(params).promise();
    } catch (err) {
        if (err.code === 'NoSuchKey') {
            throw new InternalServerError("Image not found from S3")
        } else {
            console.error(err)
          throw new InternalServerError('Error deleting file from S3');
      }
    }
};

module.exports = {
  uploadImageToAWSS3,
  deleteImageInAWSS3
}