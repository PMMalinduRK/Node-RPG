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
        match_condition: req.body.match_condition,
        rounds: req.body.rounds,
        victor: req.body.victor
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

exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }
  
    const id = req.params.id;
  
    Match.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Match with id=${id}. Maybe Match was not found!`
                });
            } else res.send({ message: "Match was updated successfully." });
        })
    .catch(err => {
        console.log(err);
        res.status(500).send({
            message: "Error updating Match with id=" + id
        });
    });
};