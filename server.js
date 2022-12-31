const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
//const port = process.env.PORT || 3000;
const port = 3000;
const path = require('path');
let socketIo = require("socket.io");
const { MongoClient } = require('mongodb');

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
    socket.on("user auth", function(user, pass){
        main(user, pass).catch(console.error);
    })
});




async function main(username, password){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = "mongodb+srv://MalinduRK:e0r2SWjof7Yh8e98@rpg-cluster.nb4qi3z.mongodb.net/Node-RPG?retryWrites=true&w=majority";

    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Search for existing data
        let exists = client.db('Node-RPG').collection('players').find(
            { "username" : username }
        );

        console.log(exists);

        // Add data
        await client.db('Node-RPG').collection('players').insertOne({
            username: username,
            password: password
        });

    } catch (e) {
        console.error(e);

    } finally {
        await client.close();
    }
}





server.listen(port, () => {
  console.log(`listening on port ${port}`);
});