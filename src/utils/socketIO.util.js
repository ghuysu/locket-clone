const socketIo = require("../configs/socketIo.config");

function emitEvent(eventName, data) {
  const io = socketIo.getIO();
  if (io) {
    io.emit(eventName, data);
  } else {
    console.error("Socket.io not initialized yet");
  }
}

module.exports = {
  emitEvent,
};
