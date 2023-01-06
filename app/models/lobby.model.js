const mongoose = require("mongoose");

const Lobby = mongoose.model(
  "Lobby",
  new mongoose.Schema({
      username: String
  })
);

module.exports = Lobby;