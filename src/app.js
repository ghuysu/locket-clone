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
const { checkApiKey } = require("./auth/apikey.auth");
const asyncHandler = require("./helpers/asyncHandler.helper");
require("dotenv").config();
require("./dbs/mongoose.db");

chokidar.watch(path.join(__dirname, "static")).on("all", (event, path) => {
  console.log(event, path);
});

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
    origin: [
      "http://localhost:5173",
      "https://skn7vgp9-5173.asse.devtunnels.ms",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);
app.use(asyncHandler(checkApiKey));
app.use("/access", accessRoute);
app.use("/account", accountRoute);
app.use("/search", searchRoute);
app.use("/feed", feedRoute);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  return res.status(404).json({ status: 404, message: "Not found" });
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  console.error(error);
  return res.status(statusCode).json({
    status: statusCode,
    message: error.message || "Internal server error",
  });
});

module.exports = app;
