$(function(){
    //let socket = io("http://localhost:3000");
    var socket = io({
        transports: [
        ]
      });
      

    // Hide the cancel button until the player clicks on play
    $("#cancel-matchmaking").hide();

    // This code block looks for the player cookie and extracts the value
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
    $("#welcome-msg").text("Welcome "+player+"!");
    //

    $("#play").click(function(){
        // Disable play button if looking for a match
        $(this).prop('disabled', true);
        $("#welcome-msg").text("Searching for players...");
        $("#cancel-matchmaking").show();
        socket.emit("player waiting", player);
    });

    $("#cancel-matchmaking").click(function(){
        $("#play").prop('disabled', false);
        $("#welcome-msg").text("Welcome "+player+"!");
        $("#cancel-matchmaking").hide();
        socket.emit("player exited matchmaking", player);
    });
});