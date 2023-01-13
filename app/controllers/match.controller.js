const db = require("../models");
const Match = db.match;

// Create and Save a new Match
exports.create = (req, res) => {
    // Validate request
    if (!req.body.match_id) {
        res.status(400).send({ message: "Match id can not be empty!" });
        return;
    }

    // Create a Match
    const match = new Match({
        match_id: req.body.match_id,
        player1: req.body.player1,
        player2: req.body.player2,
        match_data: {
            player1: {
                hp: req.body.match_data.player1.hp,
                ep: req.body.match_data.player1.ep
            },
            player2: {
                hp: req.body.match_data.player2.hp,
                ep: req.body.match_data.player2.ep
            }
        }
    });

    // Save Match in the database
    match
        .save(match)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                err.message || "Some error occurred while creating the Match."
            });
        });
};