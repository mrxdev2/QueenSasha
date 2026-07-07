/**
 * Queen Sasha 👑 - Socket.IO bridge between the web pairing page and the bot engine.
 */

const { startBot, activeSockets } = require("../../index");

module.exports = function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("🎀 A browser connected to the pairing page.");

    socket.on("pair-request", async (rawNumber) => {
      try {
        const number = String(rawNumber || "").replace(/[^0-9]/g, "");

        if (!number || number.length < 9) {
          socket.emit("pairing-error", { error: "Please enter a valid phone number with country code (e.g. 2557XXXXXXXX) 💅" });
          return;
        }

        if (activeSockets[number]) {
          socket.emit("pairing-error", { error: "This number is already paired and connected 👑" });
          return;
        }

        socket.emit("status", { message: `✨ Generating your pairing code for ${number}...` });

        await startBot(
          number,
          io,
          (code) => {
            socket.emit("pairing-code", { number, code });
          }
        );
      } catch (err) {
        socket.emit("pairing-error", { error: err.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("👋 A browser disconnected from the pairing page.");
    });
  });
};
