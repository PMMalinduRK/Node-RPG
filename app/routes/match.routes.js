module.exports = app => {
    const match = require("../controllers/match.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Match
    router.post("/", match.create);

    // Update match at the end
    router.put("/:id", match.update);
  
    app.use('/api/match', router);
  };