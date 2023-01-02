const express = require('express');
const cors = require("cors");
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
let socketIo = require("socket.io");

var corsOptions = {
    origin: "http://localhost:8081"
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
    res.sendFile(path.join(__dirname, '/resources/login.html'));
});
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/main_menu.html'));
});
app.get('/match', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/match.html'));
});
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);


const db = require("./app/models");
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


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
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
