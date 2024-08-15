"use strict";

const app = require("./src/app");
const http = require("http");
const { app: appConfig } = require("./src/configs/app.config");
const socketIo = require("./src/configs/socketIo.config");
const server = http.createServer(app);
const io = socketIo.init(server);
//variable
const PORT = appConfig.port || 9876;

//config server
server.listen(PORT, (err) => {
  if (err) {
    console.error("::Error starting the server:", err);
  } else {
    console.log(`::Server listening on Port ${PORT}`);
    io.emit("server_ready");
  }
});

//config socket io connection event
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
