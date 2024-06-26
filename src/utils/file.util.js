const Jimp = require("jimp");
const path = require("path");
const fs = require("fs").promises

const createImageFromFullname = async (lastname, firstname) => {
    //get name from name
    //ex: Huy Dao -> H D
    const name = `${lastname.charAt(0).toUpperCase()} ${firstname.charAt(0).toUpperCase()}`;
    //create image
    const image = new Jimp(200, 200, '#000000');
    //set font for text
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    //
    const textPosition = {
        text: name,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    };
    //add text to image
    image.print(font, 0, 0, textPosition, 200, 200);
    const fileName = `${name.replace(' ', '_')}_${Date.now()}.jpeg`;
    console.log(fileName);
    //save image
    const filePath = path.join(__dirname, "..", "static", "images", fileName);
    console.log(filePath);
    await image.writeAsync(filePath);
    return filePath;
}

const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        throw error;
    }
}

const getImageNameFromUrl = async (url) => {
    return url.split("/").pop()
}


module.exports = {
    createImageFromFullname,
    deleteFile,
    getImageNameFromUrl
}
