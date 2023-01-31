const mongoose = require("mongoose");

const Match = mongoose.model(
    "Match",
    new mongoose.Schema({
        match_id: String,
        player1: String,
        player2: String,
        match_condition: String,
        rounds: Number,
        victor: String
    })
);

module.exports = Match;