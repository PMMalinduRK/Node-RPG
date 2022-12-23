let express = require("express");
let bodyParser = require("body-parser");

app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post("/match", function(request, response) {
    let player = request.body.player;
    console.log("Player: " + player);
});
