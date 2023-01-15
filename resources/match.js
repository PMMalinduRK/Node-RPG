var socket = io();

$(function() {
    $("#player-attack").hide();
    $("#player-defend").hide();

    // Getting all cookies and splitting them
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    // Fetch player name from cookie
    let player;
    let name = "player=";  
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            player = c.substring(name.length, c.length);
        }
    }
    $("#join-message-player").text(player+" has joined the game");
    $("#player-name").text(player);


    // Fetch opponent name from cookie
    let player2;
    let player2_name = "player2=";
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(player2_name) == 0) {
            player2 = c.substring(player2_name.length, c.length);
        }
    }
    $("#join-message-opponent").text(player2+" has joined the game");
    $("#opponent-name").text(player2);


    $("#ready").click(function(){
        $("#ready").hide();
        $("#player-attack").show();
        $("#player-defend").show();
        //emit sth
        socket.emit("player ready", player);
    });

    socket.on("ready player", function(r_player){
        $("#moves-col").append(`<p>${r_player} is ready</p>`);
    });
});