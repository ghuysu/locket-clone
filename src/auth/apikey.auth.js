"use strict"

const APIkey = require("../models/apikey.model")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const checkApiKey = async (req, res, next) => {
    const apiKey = process.env.API_KEY
    //check api key is missing or not
    const key = req.headers["api-key"]?.toString()
    if(!key){
        return res.status(403).json({
            message: 'API key is required'
        })
    }
    //get api key and compare
    const trueAPIKey = await APIkey.findOne({key: apiKey}).lean()
    if (!trueAPIKey){
        throw new Error("Something wrong, please try later")
    }
    const match = await bcrypt.compare(key, trueAPIKey.key)
    if (!match){
        return res.status(403).json({
            message: 'API key is incorrect'
        })
    }
    return next()
}

module.exports = {
    checkApiKey
}