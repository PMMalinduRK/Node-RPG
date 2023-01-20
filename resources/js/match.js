var socket = io();

// Variable to end timer manually
let stop_timer = false;

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
    let opponent;
    let opponent_name = "opponent=";
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(opponent_name) == 0) {
            opponent = c.substring(opponent_name.length, c.length);
        }
    }

    // Update UI with opponent info
    $("#join-message-opponent").text(opponent+" has joined the game");
    $("#opponent-name").text(opponent);
    $("#ready-message-opponent").text(opponent + " is not ready yet");

    // Player ready
    $("#ready").click(function(){
        $("#ready-message-player").text("You are ready!");
        $(this).prop('disabled', true);
        
        socket.emit("player ready", player);
    });

    // Opponent ready
    socket.on("ready player", function(playerx){
        if (playerx == opponent) {
            $("#ready-message-opponent").text(opponent + " is ready!");
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

    /* let opponent_hp = $("#opponent-hp-value").text();

    $("#player-attack").click(function(){
        // Update opponent hp on first attack
        opponent_hp = parseInt(opponent_hp) - 10;
        // Create the string required to update the css "width" property
        let opponent_hp_percent = opponent_hp + "%";
        // Change css property
        $("#opponent-hp").css("width", opponent_hp_percent);
        $("#opponent-hp-value").text(opponent_hp)
    }); */

    let player_hp = parseInt($("#player-hp-value").text());
    let player_ep = parseInt($("#player-ep-value").text());
    let enemy_hp = parseInt($("#enemy-hp-value").text());
    let enemy_ep = parseInt($("#enemy-ep-value").text());

    // Player Actions
        // Action 1: attack
        // Action 2: defend
        // Action 3: heavy attack
        // Action 4: use item
        // Action 5: surrender

    let player_action = 0, opponent_action = 0;

    // Attack
    $("#player-attack").click(function(){
        if (player_ep < 10) {
            // Cannot perform action
            $("#player-action").text("Not enough energy!");
            setTimeout(function(){
                $("#player-action").text("Awaiting action");
            }, 1000);
        } else {
            // Can perform action
            player_action = 1;
            socket.emit("player action", player, player_action);
            // Disable all interactions until next round
            disableActions();
        }
    });


    // Opponent Actions
    socket.on("opponent action", function(playerx, action) {
        if (playerx == opponent) {
            opponent_action = action;
        }
    });


    // Action outcomes
    socket.on("actions received", function(player1, player2) {
        // Validate players
        if((player1 == player || player2 == player) && (player1 == opponent || player2 == opponent)){
            // End timer for the round
            stop_timer = true;

            // Switch for player actions
            switch(player_action) {
                case 1: playerAttack();
                break;

                case 2: playerDefend();
                break;

                case 3: playerHeavy();
                break;

                case 4: playerUseitem();
                break;

                case 5: playerSurrender();
                break;

                default:
                // code to be executed if n is different from case 1 and 2
            }

            // Switch for opponent actions
            switch(opponent_action) {
                case 1: opponentAttack();
                break;

                case 2: opponentDefend();
                break;

                case 3: opponentHeavy();
                break;

                case 4: opponentUseitem();
                break;

                case 5: opponentSurrender();
                break;

                default:
                // code to be executed if n is different from case 1 and 2
            } 
        }
    });

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

    $("#extra-message").text("");
    $("#player-action").text("Awaiting action");
    matchCountdown();
}

function matchCountdown() {
    let count = 60;
    var timer = setInterval(function() {
        if (count !== 0 && !stop_timer) {
            $('#countdown').text(count -= 1);
        } else {
            clearInterval(timer);
            // Start this function when the time ends
            
        }
    }, 1000); 
}

function disableActions() {
    $("#player-attack").prop('disabled', true);
    $("#player-defend").prop('disabled', true);
    $("#player-heavy").prop('disabled', true);
    $("#player-item").prop('disabled', true);
    $("#player-concede").prop('disabled', true);
}

function newRound() {
    player_action = 0, opponent_action = 0;
}

// Actions and results

function playerAttack() {
    let opponent_hp = $("#opponent-hp-value").text();
    // Update opponent hp on first attack
    let opponent_hp_value = parseInt(opponent_hp) - 10;
    // Create the string required to update the css "width" property
    let opponent_hp_percent = opponent_hp_value + "%";
    // Change css property
    $("#opponent-hp").css("width", opponent_hp_percent);
    $("#opponent-hp-value").text(opponent_hp_value);

    console.log(opponent_hp, opponent_hp_value, opponent_hp_percent);
}

function opponentAttack() {
    let player_hp = $("#player-hp-value").text();
    // Update player hp on first attack
    let player_hp_value = parseInt(player_hp) - 10;
    // Create the string required to update the css "width" property
    let player_hp_percent = player_hp_value + "%";
    // Change css property
    $("#player-hp").css("width", player_hp_percent);
    $("#player-hp-value").text(player_hp_value);
}