// Queen Sasha 👑 - Web pairing client logic

const socket = io();

const phoneInput = document.getElementById("phone");
const pairBtn = document.getElementById("pair-btn");
const statusEl = document.getElementById("status");
const codeBox = document.getElementById("code-box");
const codeEl = document.getElementById("pairing-code");

pairBtn.addEventListener("click", () => {
  const number = phoneInput.value.trim();

  if (!number) {
    statusEl.textContent = "💅 Please type your WhatsApp number first.";
    return;
  }

  pairBtn.disabled = true;
  statusEl.textContent = "✨ Connecting to Queen Sasha, please wait...";
  codeBox.style.display = "none";

  socket.emit("pair-request", number);
});

socket.on("status", (data) => {
  statusEl.textContent = data.message;
});

socket.on("pairing-code", (data) => {
  statusEl.textContent = `💖 Code generated for ${data.number}`;
  codeEl.textContent = data.code;
  codeBox.style.display = "block";
  pairBtn.disabled = false;
});

socket.on("pairing-error", (data) => {
  statusEl.textContent = `💔 ${data.error}`;
  pairBtn.disabled = false;
});

socket.on("connected", (data) => {
  statusEl.textContent = `👑 Number ${data.number} is now connected and online!`;
  codeBox.style.display = "none";
  pairBtn.disabled = false;
});

socket.on("disconnected", (data) => {
  statusEl.textContent = `🎀 Number ${data.number} got disconnected. ${data.willReconnect ? "Reconnecting..." : "Please pair again."}`;
});
