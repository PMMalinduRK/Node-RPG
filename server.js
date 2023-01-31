const express = require('express');
const cors = require("cors");
const app = express();
const http = require('http');
const server = http.createServer(app);  
const path = require('path');
const { Server } = require("socket.io");
const io = new Server(server);
// Local URL
/* const hostUrl = "http://localhost:3000"; */
// Render URL
const hostUrl = "https://node-rpg.onrender.com";
const corsOrigin = "http://localhost:3001";

// This is for making requests through the server
let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
let url = hostUrl + '/api/match/';


var corsOptions = {
    origin: hostUrl
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Connecting static file path to express
app.use(express.static(path.join(__dirname, "resources")));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/html/login.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/html/signup.html'));
});
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/html/main_menu.html'));
});
app.get('/lobby', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/html/lobby.html'));
});
app.get('/match', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/html/match.html'));
});
app.get('/redirect', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/html/redirect.html'));
});

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/lobby.routes')(app);
require('./app/routes/match.routes')(app);


const db = require("./app/models");
const { log } = require('console');
const Role = db.role;

db.mongoose
    .connect("mongodb+srv://MalinduRK:e0r2SWjof7Yh8e98@rpg-cluster.nb4qi3z.mongodb.net/Node_RPG?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
        initial();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });


// Initialize player array for matchmaking through the server
let player_array = [];

// Setup the websocket.
io.on("connection", (socket) => {

    // General
    console.log("Connected to socket");


    // Matchmaking
    socket.on("player waiting", function(player){
        // Database stuff
        console.log(`Player ${player} is waiting in lobby`);
        // socket.emit doesn't work here. io.emit does
        io.emit("Recount lobby");
    });

    socket.on("player exited matchmaking", function(player){
        // Remove player from matchmaking list
        console.log(`Player ${player} exited the lobby`);
        io.emit("Recount lobby");
    });

    socket.on("match found", function(player){
        // Add players into an array
        player_array.push(player);
        console.log(player_array);
        if(player_array.length == 2){
            // Get date for the construction of match_id
            const date = new Date();

            // Process the json data
            let player1 = player_array[0];
            let player2 = player_array[1];
            let match_id = player1 + player2 + date.toISOString();

            let data = JSON.stringify(
                {
                    "match_id": match_id,
                    "player1": player1,
                    "player2": player2,
                    "match_condition": "ongoing",
                    "rounds": 0,
                    "victor": "TBA"
                }
            )

            // Create a POST request through the server to create a match and add the two players into the match
            let response;
            let xhr = new XMLHttpRequest();
            xhr.open('POST',url);
            xhr.setRequestHeader('Content-Type','application/json');
            xhr.send(data);
            // Get the response of the post request
            xhr.onreadystatechange = function() {
                response = xhr.responseText;
                console.log(response);

                // After the POST, send both players to the match
                io.emit("enter match", player1, player2, response._id);
            };            
            
            // Clear player_array for next function
            player_array = [];
        }
    });


    // In-game
    socket.on("player ready", function(player){
        io.emit("ready player", player);

        player_array.push(player);
        console.log(player_array);
        if(player_array.length == 2){
            io.emit("start countdown", player_array[0], player_array[1]);
            player_array = [];
        }
    });

    socket.on("player action", function(player, action){
        io.emit("opponent action", player, action);

        player_array.push(player);
        console.log(player_array);
        if(player_array.length == 2){
            io.emit("actions received", player_array[0], player_array[1]);
            player_array = [];
        }
    });
});


// set port, listen for requests
const PORT = 3000;
// This isn't app.listen but server.listen
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});


function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'user' to roles collection");
            });

            new Role({
                name: "moderator"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'moderator' to roles collection");
            });

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'admin' to roles collection");
            });
        }
    });
}
