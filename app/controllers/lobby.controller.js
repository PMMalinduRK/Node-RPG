const db = require("../models");
const Lobby = db.lobby;

// Create and Save a new Lobby
exports.create = (req, res) => {
    // Validate request
    if (!req.body.username) {
        res.status(400).send({ message: "Username can not be empty!" });
        return;
    }

    // Create a Lobby
    const lobby = new Lobby({
        username: req.body.username
    });

    // Save Lobby in the database
    lobby
        .save(lobby)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                err.message || "Some error occurred while creating the Lobby."
            });
        });
};

// Retrieve all Lobbies from the database.
exports.findAll = (req, res) => {
  
};

// Find a single user with username
exports.findOne = (req, res) => {

};

// Update a Lobby by the id in the request
exports.update = (req, res) => {
  
};

// Delete a Lobby with the specified username in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Lobby.findByIdAndRemove(id)
        .then(data => {
            if (!data) {
                res.status(404).send({
                message: `Cannot delete User with id=${id}. Maybe User was not found!`
                });
            } else {
                res.send({
                message: "User was removed from lobby!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete User with id=" + id
            });
            console.log(err);
        });
};

// Delete all Lobbys from the database.
exports.deleteAll = (req, res) => {
  
};

// Find all published Lobbys
exports.findAllPublished = (req, res) => {
  
};

// Count the number of players in the lobby
exports.countPlayers = (req, res) => {
    Lobby.countDocuments()
        .then(data => {
            if (!data) {
                res.status(404).send({
                message: "There are no players online"
                });
            } else {
                res.send({
                message: `There are ${data} players online`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error finding players"
            });
            console.log(err);
        });
};