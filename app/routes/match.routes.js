module.exports = app => {
    const match = require("../controllers/match.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Match
    router.post("/", match.create);
  
    app.use('/api/match', router);
  };