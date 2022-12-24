//const port = process.env.PORT || 3000;

$(function() {
    console.log("websocket working");

    let socket = io("http://localhost:3000");

    let player;
    let name = "player=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        player = c.substring(name.length, c.length);
        }
    }

    socket.emit("player waiting", player);

    socket.on("player join", function(new_player){
        console.log("New player joined the lobby");
        console.log(new_player);
        $("#moves-col").append(new_player+" has joined the game");
    });
});