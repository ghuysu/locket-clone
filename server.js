"use strict";

const app = require("./src/app");
const { app: appConfig } = require("./src/configs/app.config");
const PORT = appConfig.port || 9876;

const server = app.listen(PORT, (err) => {
    if (err) {
        console.error("::Error starting the server:", err);
    } else {
        console.log(`::Server listening on Port ${PORT}`);
    }
});

//Ctrl + C: close server 
process.on("SIGINT", () => {
    console.log("::SIGINT received, closing server...");
    server.close(() => {
        console.log("::Server Closed");
        process.exit(0); // Thoát quá trình sau khi đóng server
    });
});