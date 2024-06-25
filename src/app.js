const compression = require("compression")
const express = require("express")
const helmet = require("helmet")
const morgan = require("morgan")
const chokidar = require("chokidar")
const path = require("path")
const accessRoute = require("./routes/access.route")
require("dotenv").config()
require("./dbs/mongoose.db")

chokidar.watch(path.join(__dirname, "static")).on('all', (event, path) => {
    console.log(event, path);
});

const app = express()

app.use(morgan("combined"))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use("/access", accessRoute)

app.use((req, res, next) => {
    const error = new Error("Not found")
    error.status = 404
    return res.status(404).json({"status":404,"message":"Not found"})
})

app.use((error, req, res, next) => {
    console.error(error)
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: statusCode,
        message: error.message || "Internal server error"
    })
})

module.exports = app