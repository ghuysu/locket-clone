"use strict";

const app = require("./src/app");
const http = require("http");
const { app: appConfig } = require("./src/configs/app.config");
const socketIo = require("./src/configs/socketIo.config");

const server = http.createServer(app);
const io = socketIo.init(server);

const PORT = appConfig.port || 9876;

server.listen(PORT, (err) => {
  if (err) {
    console.error("::Error starting the server:", err);
  } else {
    console.log(`::Server listening on Port ${PORT}`);
    io.emit("server_ready");
  }
});

io.on("connection", (socket) => {
  console.log(`Client connected:: ${socket.id}`);
});

// Ctrl + C: close server
process.on("SIGINT", () => {
  console.log("::SIGINT received, closing server...");
  server.close(() => {
    console.log("::Server Closed");
    process.exit(0);
  });
});

// File watcher (chokidar)
const chokidar = require("chokidar");
const path = require("path");

chokidar.watch(path.join(__dirname, "static")).on("all", (event, path) => {
  console.log(event, path);
});
