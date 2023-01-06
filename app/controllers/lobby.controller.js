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
    const user = req.params.username;

    Lobby.findById(user)
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Cannot find user with username " + user });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving User with username=" + user });
        });
};

// Update a Lobby by the id in the request
exports.update = (req, res) => {
  
};

// Delete a Lobby with the specified username in the request
exports.delete = (req, res) => {
    const user = req.params.username;

    Lobby.findByIdAndRemove(user)
        .then(data => {
            if (!data) {
                res.status(404).send({
                message: `Cannot delete User with id=${user}. Maybe User was not found!`
                });
            } else {
                res.send({
                message: "User was removed from lobby!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete User with username=" + user
            });
        });
};

// Delete all Lobbys from the database.
exports.deleteAll = (req, res) => {
  
};

// Find all published Lobbys
exports.findAllPublished = (req, res) => {
  
};