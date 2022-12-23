const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const path = require('path');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/login.html'));
});
app.get('/match', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/match.html'));
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});