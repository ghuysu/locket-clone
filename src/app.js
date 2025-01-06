const compression = require("compression");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const chokidar = require("chokidar");
const path = require("path");
const cors = require("cors");
const accessRoute = require("./routes/access.route");
const accountRoute = require("./routes/account.route");
const searchRoute = require("./routes/search.route");
const feedRoute = require("./routes/feed.route");
const messageRoute = require("./routes/message.route");
const { checkApiKey } = require("./auth/apikey.auth");
const asyncHandler = require("./helpers/asyncHandler.helper");
require("dotenv").config();
require("./dbs/mongoose.db");

//supervise file change
chokidar.watch(path.join(__dirname, "static")).on("all", (event, path) => {
  console.log(event, path);
});

//config app
const app = express();
app.use(morgan("combined"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  cors({
    origin: "*",
  })
);

//apply check api function
app.use(asyncHandler(checkApiKey));
//apply routes
app.use("/access", accessRoute);
app.use("/account", accountRoute);
app.use("/search", searchRoute);
app.use("/feed", feedRoute);
app.use("/message", messageRoute);
//apply 404 route
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  return res.status(404).json({ status: 404, message: "Not found" });
});
//apply error route
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  console.error(error);
  return res.status(statusCode).json({
    status: statusCode,
    message: error.message || "Internal server error",
  });
});

module.exports = app;
