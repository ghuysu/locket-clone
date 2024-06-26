const AWS = require('aws-sdk')
const fs = require("fs");
require("dotenv").config()


AWS.config.update({
    accessKeyId: process.env.AWSS3_ACCESS_KEY,
    secretAccessKey: process.env.AWSS3_SECRET_ACCESS_KEY,
    region: process.env.AWSS3_REGION
});

const s3 = new AWS.S3();

const uploadImageToAWSS3 = async (imagePath) => {
    //load imagebuffer from imagePath
    const imageBuffer = await fs.promises.readFile(imagePath);
    //get imageName from path
    let imageName = imagePath.split('/')
    imageName = imageName[imageName.length-1]
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

const deleteImage = async (imageName) => {
  imageName = decodeURIComponent(imageName.replace(/%/g, ":"))
  console.log(imageName)
  
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: imageName
  }
  try {  
    await s3.headObject(params).promise()
    console.log("File Found in S3")
  try {
    await s3.deleteObject(params).promise()
    console.log("file deleted Successfully")
  }
  catch (err) {
    err.statusCode = 500
    console.log("ERROR in file Deleting : " + JSON.stringify(err))
    throw err
  }
  } catch (err) {
    err.statusCode = 500
    console.log("File not Found ERROR : " + err.code)
    throw err
  }

};

module.exports = {
  uploadImageToAWSS3,
  deleteImage
}