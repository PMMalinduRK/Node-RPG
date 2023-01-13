const mongoose = require("mongoose");

const Match = mongoose.model(
    "Match",
    new mongoose.Schema({
        match_id: String,
        player1: String,
        player2: String,
        match_data: {
            player1: {
                hp: Number,
                ep: Number
            },
            player2: {
                hp: Number,
                ep: Number
            }
        }
    })
);

module.exports = Match;