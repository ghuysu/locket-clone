require("dotenv").config()

const DEV = {
    app: {
        port: process.env.DEV_APP_PORT
    },
    db: {
        username: process.env.DEV_DB_USERNAME,
        password: process.env.DEV_DB_PASSWORD,
        collection: process.env.DEV_DB_COLLECTION
    }
}

const PROD = {
    app: {
        port: process.env.PROD_APP_PORT
    },
    db: {
        username: process.envPROD_DB_USERNAME,
        password: process.env.PROD_DB_PASSWORD,
        collection: process.env.PROD_DB_COLLECTION
    }
}

const CONFIG = {
    DEV, PROD
}

const ENV = process.env.NODE_ENV || 'DEV'
module.exports = CONFIG[ENV]