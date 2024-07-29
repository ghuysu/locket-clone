const multer = require("multer")
const path = require('path');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../static/images'))
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || "image/jpg" || "image/jpeg") {
        cb(null, true)
    } 
    else {
        cb(null, false)
    }
}

const limits = {
    fileSize: 1024 * 1024 * 20 //limit 20mb
}

const uploadImage = multer({storage: fileStorage, fileFilter: fileFilter, limits: limits})

module.exports = {
    uploadImage
}