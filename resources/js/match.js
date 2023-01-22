$(function() {
    var socket = io();

    // Variable to end timer manually
    let timer;
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
            console.log("Player confirmed");

            $("#extra-message").text("Match Starting...");

            // Set the countdown
            let count = 3; // CHANGE THIS TO 10!!!!!!!!!!!!!
            timer = setInterval(function() {
                if (count != 0) {
                    $('#countdown').text(count--);
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

    // Heavy Attack
    $("#player-heavy").click(function(){
        let player_ep = $("#player-ep-value").text();
        if (player_ep < 15) {
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

    // Attack
    $("#player-attack").click(function(){
        let player_ep = $("#player-ep-value").text();
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

    // Defend
    $("#player-defend").click(function(){
        player_action = 3;
        socket.emit("player action", player, player_action);
        // Disable all interactions until next round
        disableActions();
    });


    // Opponent Actions
    socket.on("opponent action", function(playerX, action) {
        if (playerX == opponent) {
            opponent_action = action;
        }
    });


    // Action outcomes
    socket.on("actions received", function(player1, player2) {
        console.log("Both player actions received");
        // Validate players
        if((player1 == player || player2 == player) && (player1 == opponent || player2 == opponent)){
            // End timer for the round
            clearInterval(timer);

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
            setTimeout(function(){
                switch(end) {
                    case 0: newRound(); console.log("starting new round"); break;
                    case 1: tie(); break;
                    case 2: playerWin(); break;
                    case 3: opponentWin(); break;
                }
            }, 5000);
        }
    });

    function startMatch() {
        console.log("Match started");
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
        $("#round").text("Round " + round);
        roundCountdown();
    }
    
    function roundCountdown() {
        let count = 60;
        console.log("Countdown begin");
        $('#countdown').text(count);

        timer = setInterval(function() {
            if (count != 0) {
                $('#countdown').text(count--);
            } else {
                clearInterval(timer);
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

    function enableActions() {
        $("#player-attack").prop('disabled', false);
        $("#player-defend").prop('disabled', false);
        $("#player-heavy").prop('disabled', false);
        $("#player-item").prop('disabled', false);
        $("#player-concede").prop('disabled', false);
    }
    
    function newRound() {
        // Reset player actions
        player_action = 0, opponent_action = 0;
        console.log("new round starting");
        $("#player-action").text("Awaiting action");
        $("#opponent-action").text("");
        $("#player-result").text("");
        $("#opponent-result").text("");

        // Replenish some energy
        replenishEnergy();
        roundCountdown();
        enableActions();

        // Update round number
        round++;
        $("#round").text("Round " + round);
    }

    function replenishEnergy() {
        let player_ep = parseInt($("#player-ep-value").text());
        if (player_ep <= 95) {
            let player_ep_value = player_ep + 5;
            let player_ep_percent = player_ep_value + "%";
            $("#player-ep").css("width", player_ep_percent);
            $("#player-ep-value").text(player_ep_value);
        }

        let opponent_ep = parseInt($("#opponent-ep-value").text());
        if (opponent_ep <= 95) {
            let opponent_ep_value = opponent_ep + 5;
            let opponent_ep_percent = opponent_ep_value + "%";
            $("#opponent-ep").css("width", opponent_ep_percent);
            $("#opponent-ep-value").text(opponent_ep_value);
        }
    }
    
    function playerAction(player_action) {
        // Switch for player actions
        switch(player_action) {
            case 1: heavy("player");
                $("#player-action").text(player + " strikes with force!");
                break;
            case 2: attack("player");
                $("#player-action").text(player + " is attacking!");
                break;
            case 3: defend("player");
                $("#player-action").text(player + " raised their shield!");
                break;
            case 4: useItem("player");
                $("#player-action").text(player + " used [item_name]!");
                break;
            case 5: surrender("player");
                $("#player-action").text(player + " flees!");
                break;
        }
    }
    
    function opponentAction(opponent_action) {
        // Switch for opponent actions
        switch(opponent_action) {
            case 1: heavy("opponent");
                $("#opponent-action").text(opponent + " strikes with force!");
                break;
            case 2: attack("opponent");
                $("#opponent-action").text(opponent + " is attacking!");
                break;
            case 3: defend("opponent");
                $("#opponent-action").text(opponent + " raised their shield!");
                break;
            case 4: useItem("opponent");
                $("#opponent-action").text(opponent + " used [item_name]!");
                break;
            case 5: surrender("opponent");
                $("#opponent-action").text(opponent + " flees!");
                break;
        } 
    }
    
    // Actions and results

    function heavy(playerX) {
        // Dynamic actor for both the player and opponent
        let actor = playerX;
        // Initialize variables
        let actor_hp;
        let actor_ep;
        let receiver_hp;
        let receiver_ep;
        // Take opponent action into account before calculating output
        let receiver_action;

        if (actor == "player") {
            actor_hp = parseInt($("#player-hp-value").text());
            actor_ep = parseInt($("#player-ep-value").text());
            receiver_hp = parseInt($("#opponent-hp-value").text());
            receiver_ep = parseInt($("#opponent-ep-value").text());
            $("#player-action").text("You performed a heavy attack");
            receiver_action = opponent_action;
        } else {
            actor_hp = parseInt($("#opponent-hp-value").text());
            actor_ep = parseInt($("#opponent-ep-value").text());
            receiver_hp = parseInt($("#player-hp-value").text());
            receiver_ep = parseInt($("#player-ep-value").text());
            $("#opponent-action").text(opponent + " performed a heavy attack");
            receiver_action = player_action;
        }

        // Update actor ep
        let actor_ep_value = actor_ep - 15;
        // Initialize actor/receiver hp
        let actor_hp_value;
        let receiver_hp_value;

        // Attack interrupted
        if (receiver_action == 2) {
            // Update actor hp
            actor_hp_value = actor_hp - 15;
            if (actor == "player") {
                $("#player-result").text("You got staggered for 15 damage!");
            } else {
                $("#opponent-result").text(opponent + " got staggered for 15 damage!");
            }
        // Block bypassed
        } else if (receiver_action == 3){
            // Update receiver hp
            receiver_hp_value = receiver_hp - 5;
            if (actor == "player") {
                $("#player-result").text("You broke the opponent's block for 5 damage!");
            } else {
                $("#opponent-result").text(opponent + " broke your block for 5 damage!");
            }
        // Full swing
        } else {
            // Update receiver hp
            receiver_hp_value = receiver_hp - 20;
            if (actor == "player") {
                $("#player-result").text("You did a full swing at the opponent for 20 damage!");
            } else {
                $("#opponent-result").text(opponent + " did a full swing at you for 20 damage!");
            }
        }
        
        // Prevent hp from going below zero
        if (receiver_hp_value < 0) {
            receiver_hp_value = 0;
        }
        // Create the string required to update the css "width" property
        let receiver_hp_percent = receiver_hp_value + "%";
        let actor_hp_percent = actor_hp_value + "%";
        let actor_ep_percent = actor_ep_value + "%";

        // Change css property
        if (actor == "player") {
            $("#opponent-hp").css("width", receiver_hp_percent);
            $("#opponent-hp-value").text(receiver_hp_value);
            $("#player-hp").css("width", actor_hp_percent);
            $("#player-hp-value").text(actor_hp_value);
            $("#player-ep").css("width", actor_ep_percent);
            $("#player-ep-value").text(actor_ep_value);
        } else {
            $("#player-hp").css("width", receiver_hp_percent);
            $("#player-hp-value").text(receiver_hp_value);
            $("#opponent-hp").css("width", actor_hp_percent);
            $("#opponent-hp-value").text(actor_hp_value);
            $("#opponent-ep").css("width", actor_ep_percent);
            $("#opponent-ep-value").text(actor_ep_value);
        }
    }

    function attack(playerX) {
        // Dynamic actor for both the player and opponent
        let actor = playerX;
        // Initialize variables
        let actor_hp;
        let actor_ep;
        let receiver_hp;
        let receiver_ep;
        // Take opponent action into account before calculating output
        let receiver_action;

        if (actor == "player") {
            actor_hp = parseInt($("#player-hp-value").text());
            actor_ep = parseInt($("#player-ep-value").text());
            receiver_hp = parseInt($("#opponent-hp-value").text());
            receiver_ep = parseInt($("#opponent-ep-value").text());
            $("#player-action").text("You performed an attack");
            receiver_action = opponent_action;
        } else {
            actor_hp = parseInt($("#opponent-hp-value").text());
            actor_ep = parseInt($("#opponent-ep-value").text());
            receiver_hp = parseInt($("#player-hp-value").text());
            receiver_ep = parseInt($("#player-ep-value").text());
            $("#opponent-action").text(opponent + " performed an attack");
            receiver_action = player_action;
        }

        // Update actor ep
        let actor_ep_value = actor_ep - 10;
        // Initialize receiver hp
        let receiver_hp_value;

        // Attack blocked
        if (receiver_action == 3) {
            // Update receiver hp
            receiver_hp_value = receiver_hp - 0;
            if (actor == "player") {
                $("#opponent-result").text(opponent + " blocked the attack!");
            } else {
                $("#player-result").text("You blocked the attack!");
            }
        } else {
            // Update receiver hp
            receiver_hp_value = receiver_hp - 10;
            if (actor == "player") {
                $("#opponent-result").text(opponent + " received 10 damage!");
            } else {
                $("#player-result").text("You received 10 damage!");
            }
        }
        
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

    function defend(playerX) {
        // Dynamic actor for both the player and opponent
        let actor = playerX;

        if (actor == "player") {
            $("#player-action").text("You are defending");
        } else {
            $("#opponent-action").text(opponent + " is defending");
        }
    }




    function checkEndCondition() {
        let player_hp = $("#player-hp-value").text();
        let opponent_hp = $("#opponent-hp-value").text();
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

