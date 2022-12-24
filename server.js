const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
//const port = process.env.PORT || 3000;
const port = 3000;
const path = require('path');
let socketIo = require("socket.io");

// Connecting static file path to express
app.use(express.static(path.join(__dirname, "resources")));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/login.html'));
});
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/main_menu.html'));
});
app.get('/match', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/match.html'));
});

// Setup the websocket.
let io = socketIo(server);

io.on("connection", function(socket) {
    console.log("Connected to socket");
    socket.on("player waiting", function(player){
        // Database stuff
    });
    socket.on("player exited matchmaking", function(player){
        // Remove player from matchmaking list
    });
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});