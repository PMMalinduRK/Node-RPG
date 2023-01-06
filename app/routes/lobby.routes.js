module.exports = app => {
    const lobby = require("../controllers/lobby.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Lobby
    router.post("/", lobby.create);
  
    // Retrieve all Lobby
    router.get("/", lobby.findAll);
  
    // Retrieve all published Lobby
    router.get("/published", lobby.findAllPublished);
  
    // Retrieve a single Lobby with username
    router.get("/:username", lobby.findOne);
  
    // Update a Lobby with id
    router.put("/:id", lobby.update);
  
    // Delete a Lobby with username
    router.delete("/:username", lobby.delete);
  
    // Delete all Lobby
    router.delete("/", lobby.deleteAll);
  
    app.use('/api/lobby', router);
  };