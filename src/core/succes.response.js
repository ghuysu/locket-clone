'use strict'

const {StatusCodes, ReasonPhrases} = require("./httpStatusCode")

class SuccessResponse{
    
    constructor({message, statusCode = StatusCodes.OK, reasonPhrase = ReasonPhrases.OK, metadata = {}}){
        this.message = !message ? reasonPhrase : message
        this.status = statusCode
        this.reasonPhrase = reasonPhrase
        this.metadata = metadata
    }

    send(res, headers = {}){
        return res.status(this.status).json(this)
    }
}

class OK extends SuccessResponse{
    constructor({message, metadata}){
        super({message, metadata})
    }
}

class CREATED extends SuccessResponse{
    constructor({message, statusCode = StatusCodes.CREATED, reasonPhrase = ReasonPhrases.CREATED, metadata = {}}){
        super({message, statusCode, reasonPhrase, metadata})
    }
}

module.exports = {
    OK,
    CREATED
}