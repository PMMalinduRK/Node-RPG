var socket = io();

$(function() {
    // Hide action buttons before match start
    $("#player-attack").hide();
    $("#player-defend").hide();
    $("#player-heavy").hide();
    $("#player-item").hide();
    $("#player-concede").hide();

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

    // Update UI with player info
    $("#join-message-player").text("You have joined the game");
    $("#player-name").text(player);
    $("#ready-message-player").text("You are not ready yet");


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

    // Update UI with opponent info
    $("#join-message-opponent").text(player2+" has joined the game");
    $("#opponent-name").text(player2);
    $("#ready-message-opponent").text(player2 + " is not ready yet");

    // Player ready
    $("#ready").click(function(){
        $("#ready-message-player").text("You are ready!");
        $(this).prop('disabled', true);
        
        socket.emit("player ready", player);
    });

    // Opponent ready
    socket.on("ready player", function(r_player){
        if (r_player == player2) {
            $("#ready-message-opponent").text(player2 + " is ready!");
        }
    });

    // Match start countdown
    socket.on("start countdown", function(player1, player2){
        console.log("Countdown starting");
        // Validation for emit reciever
        if(player==player1 || player==player2){
            console.log("If condition passed");

            $("#extra-message").text("Match Starting...");

            // Set the countdown
            let count = 10;
            var timer = setInterval(function() {
                if (count !== 0) {
                    $('#countdown').text(count -= 1);
                } else {
                    clearInterval(timer);
                    // Start this function when the time ends
                    startMatch();
                }
            }, 1000);            
            
        } else {
            console.log("Something went wrong while validating player");
        }
    });

    let opponent_hp = $("#opponent-hp-value").text();

    $("#player-attack").click(function(){
        // Update opponent hp on first attack
        opponent_hp = parseInt(opponent_hp) - 10;
        // Create the string required to update the css "width" property
        let opponent_hp_percent = opponent_hp + "%";
        // Change css property
        $("#opponent-hp").css("width", opponent_hp_percent);
        $("#opponent-hp-value").text(opponent_hp)
    });


    // Player Actions
    $("#player-attack").click(function(){

    });


    // Opponent Actions
});

function startMatch() {
    // Hide starting messages
    $("#join-message-player").hide();
    $("#join-message-opponent").hide();
    $("#ready-message-player").hide();
    $("#ready-message-opponent").hide();

    // Hide ready button
    $("#ready").hide();
    // Show action buttons
    $("#player-attack").show();
    $("#player-defend").show();
    $("#player-heavy").show();
    $("#player-item").show();
    $("#player-concede").show();

    $("#extra-message").text("Awaiting action");
}

function matchCountdown() {
    let count = 60;
    var timer = setInterval(function() {
        if (count !== 0) {
            $('#countdown').text(count -= 1);
        } else {
            clearInterval(timer);
            // Start this function when the time ends
            startMatch();
        }
    }, 1000); 
}