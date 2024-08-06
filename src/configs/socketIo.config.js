let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: {
        origin: [
          "http://localhost:5173",
          "https://skn7vgp9-5173.asse.devtunnels.ms",
        ],
        methods: ["GET", "POST", "PATCH", "DELETE"],
      },
    });
    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io is not initialized");
    }
    return io;
  },
};
