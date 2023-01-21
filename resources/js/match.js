$(function() {
    var socket = io();

    // Variable to end timer manually
    let stop_timer = false;
    // Round counter
    let round = 0;
    // End condition
    let end = 0;

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
    socket.on("ready player", function(playerX){
        if (playerX == opponent) {
            $("#ready-message-opponent").text(opponent + " is ready!");
        }
    });

    // Match start countdown
    socket.on("start countdown", function(player1, player2){
        console.log("Countdown starting");
        // Validation for emit receiver
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

    let player_hp = parseInt($("#player-hp-value").text());
    let player_ep = parseInt($("#player-ep-value").text());
    let opponent_hp = parseInt($("#opponent-hp-value").text());
    let opponent_ep = parseInt($("#opponent-ep-value").text());

    // Player Actions
        // Action 1: heavy attack
        // Action 2: attack
        // Action 3: defend
        // Action 4: use item
        // Action 5: surrender
    // Action priority
        // Surrender
        // Use item
        // Defend
        // Attack
        // Heavy attack

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
            player_action = 2;
            socket.emit("player action", player, player_action);
            // Disable all interactions until next round
            disableActions();
        }
    });


    // Opponent Actions
    socket.on("opponent action", function(playerX, action) {
        if (playerX == opponent) {
            opponent_action = action;
        }
    });


    // Action outcomes
    socket.on("actions received", function(player1, player2) {
        // Validate players
        if((player1 == player || player2 == player) && (player1 == opponent || player2 == opponent)){
            // End timer for the round
            stop_timer = true;

            // Check priorities
            if (player_action > opponent_action) {
                playerAction(player_action);
                end = checkEndCondition();
                // Let other player take action only if the match didn't end
                if (end == 0) {
                    setTimeout(opponentAction(opponent_action), 3000);
                }
            } else if (opponent_action > player_action) {
                opponentAction(opponent_action);
                end = checkEndCondition();
                if (end == 0) {
                    setTimeout(playerAction(player_action), 3000);
                }
            } else {
                playerAction(player_action);
                opponentAction(opponent_action);
                end = checkEndCondition();
            }

            // End match if either of the players have reached 0 hp first
            switch(end) {
                case 0: /* Continue match */ break;
                case 1: tie(); break;
                case 2: playerWin(); break;
                case 3: opponentWin(); break;
            }
        }
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
        // Start round
        round++;
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
    
    function playerAction(player_action) {
        // Switch for player actions
        switch(player_action) {
            case 1: playerHeavy(); break;
            case 2: attack("player"); break;
            case 3: playerDefend(); break;
            case 4: playerUseitem(); break;
            case 5: playerSurrender(); break;
        }
    }
    
    function opponentAction(opponent_action) {
        // Switch for opponent actions
        switch(opponent_action) {
            case 1: opponentHeavy(); break;
            case 2: attack("opponent"); break;
            case 3: opponentDefend(); break;
            case 4: opponentUseitem(); break;
            case 5: opponentSurrender(); break;
        } 
    }
    
    // Actions and results
    
    /* function playerAttack() {
        // Update player ep
        let player_ep_value = parseInt(player_ep) - 10;
        // Update opponent hp
        let opponent_hp_value = parseInt(opponent_hp) - 10;
        // Prevent hp from going below zero
        if (opponent_hp_value < 0) {
            opponent_hp_value = 0;
        }
        // Create the string required to update the css "width" property
        let opponent_hp_percent = opponent_hp_value + "%";
        let player_ep_percent = player_ep_value + "%";
        // Change css property
        $("#opponent-hp").css("width", opponent_hp_percent);
        $("#opponent-hp-value").text(opponent_hp_value);
        $("#player-ep").css("width", player_ep_percent);
        $("#player-ep-value").text(player_ep_value);
    
        console.log(opponent_hp, opponent_hp_value, opponent_hp_percent);
    }
    
    function opponentAttack() {
        // Update opponent ep
        let opponent_ep_value = parseInt(opponent_ep) - 10;
        // Update player hp
        let player_hp_value = parseInt(player_hp) - 10;
        // Prevent hp from going below zero
        if (player_hp_value < 0) {
            player_hp_value = 0;
        }
        // Create the string required to update the css "width" property
        let player_hp_percent = player_hp_value + "%";
        let opponent_ep_percent = opponent_ep_value + "%";
        // Change css property
        $("#player-hp").css("width", player_hp_percent);
        $("#player-hp-value").text(player_hp_value);
        $("#opponent-ep").css("width", opponent_ep_percent);
        $("#opponent-ep-value").text(opponent_ep_value);
    } */

    function attack(playerX) {
        // Dynamic actor for both the player and opponent
        let actor = playerX;
        // Initialize variables
        let actor_hp;
        let actor_ep;
        let receiver_hp;
        let receiver_ep;

        if (actor == "player") {
            actor_hp = player_hp;
            actor_ep = player_ep;
            receiver_hp = opponent_hp;
            receiver_ep = opponent_ep;
        } else {
            receiver_hp = player_hp;
            receiver_ep = player_ep;
            actor_hp = opponent_hp;
            actor_ep = opponent_ep;
        }
        
        // Update actor ep
        let actor_ep_value = actor_ep - 10;
        // Update receiver hp
        let receiver_hp_value = receiver_hp - 10;
        // Prevent hp from going below zero
        if (receiver_hp_value < 0) {
            receiver_hp_value = 0;
        }
        // Create the string required to update the css "width" property
        let receiver_hp_percent = receiver_hp_value + "%";
        let actor_ep_percent = actor_ep_value + "%";

        // Change css property
        if (actor == "player") {
            $("#opponent-hp").css("width", receiver_hp_percent);
            $("#opponent-hp-value").text(receiver_hp_value);
            $("#player-ep").css("width", actor_ep_percent);
            $("#player-ep-value").text(actor_ep_value);
        } else {
            $("#player-hp").css("width", receiver_hp_percent);
            $("#player-hp-value").text(receiver_hp_value);
            $("#opponent-ep").css("width", actor_ep_percent);
            $("#opponent-ep-value").text(actor_ep_value);
        }
    }





    function checkEndCondition() {
        // Return victor after checking a few different end-game conditions
        if (opponent_hp != 0 && player_hp != 0) {
            // Continue match
            return 0;
        }
        else if (opponent_hp == 0 && player_hp == 0) {
            // Tie
            return 1;
        }
        else if (opponent_hp == 0) {
            // Player wins
            return 2;
        }
        else {
            // Opponent wins
            return 3;
        }
    }

    // End game functions

    function tie() {
        $("#extra-message").text("Match tied!");
        let count = 10;
        var timer = setInterval(function() {
            if (count !== 0) {
                $('#countdown').text(count -= 1);
            } else {
                clearInterval(timer);
                // Start this function when the time ends
                // Load main menu
                window.location.href = "/main";
            }
        }, 1000); 
    }

    function playerWin() {
        $("#extra-message").text("You win!");
        let count = 10;
        var timer = setInterval(function() {
            if (count !== 0) {
                $('#countdown').text(count -= 1);
            } else {
                clearInterval(timer);
                // Start this function when the time ends
                // Load main menu
                window.location.href = "/main";
            }
        }, 1000); 
    }

    function opponentWin() {
        $("#extra-message").text("You lose!");
        let count = 10;
        var timer = setInterval(function() {
            if (count !== 0) {
                $('#countdown').text(count -= 1);
            } else {
                clearInterval(timer);
                // Start this function when the time ends
                // Load main menu
                window.location.href = "/main";
            }
        }, 1000); 
    }

});

