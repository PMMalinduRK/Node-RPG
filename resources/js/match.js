var socket = io();

$(function() {
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
        $("#player-heavy").show();
        $("#player-item").show();
        $("#player-concede").show();
        socket.emit("player ready", player);
    });

    socket.on("ready player", function(r_player){
        $("#info-container").append(`<p>${r_player} is ready</p>`);
    });

    socket.on("start countdown", function(player1, player2){
        console.log("Countdown starting");
        // Validation for emit reciever
        if(player==player1 || player==player2){
            console.log("If condition passed");

            // Set the countdown
            let count = 10;
            var timer = setInterval(function() {
                if (count !== 0) {
                    $('#countdown').text(count -= 1);
                } else {
                    clearInterval(timer);
                }
            }, 1000);
            
        } else {
            console.log("Something went wrong while validating player");
        }
    });

    let enemy_hp = $("#enemy-hp-value").text();

    $("#player_attack").click(function(){
        // Update enemy hp on first attack
        enemy_hp = parseInt(enemy_hp) - 10;
        // Create the string required to update the css "width" property
        let enemy_hp_percent = enemy_hp + "%";
        // Change css property
        $("#enemy-hp").css("width", enemy_hp_percent);
        $("#enemy-hp-value").text(enemy_hp)
    });
});