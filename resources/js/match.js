$(function() {
    var socket = io();

    // Variable to end timer manually
    let timer;
    // Round counter
    let round = 0;
    // End condition
    let end = 0;
    // Player items
    let player_items = [];
    let selected_item;

    // Item catalogue
    let items = [
        "heal", // heal for 10HP
        "empower", // increase attack power by 5 for 2 rounds
        "sap", // drain 20EP from opponent
        "fortify", // can't get staggered for 3 rounds
    ];

    let item_array_length = items.length;

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

    // If the player or opponent is undefined, send to redirect page
    if (player != undefined && opponent != undefined) {
        document.getElementsByTagName("html")[0].style.visibility = "visible";
    } else {
        window.location.href = "/redirect";
    }

    // Update UI with opponent info
    $("#join-message-opponent").text(opponent+" has joined the game");
    $("#opponent-name").text(opponent);
    $("#ready-message-opponent").text(opponent + " is not ready yet");

    // Player ready
    $("#ready").click(function(){
        $("#ready-message-player").text("You are ready!");
        $(this).prop('disabled', true);
        // Disable animations
        $("#ready-message-player").css("animation-iteration-count", "unset");
        
        socket.emit("player ready", player);
    });

    // Opponent ready
    socket.on("ready player", function(playerX){
        if (playerX == opponent) {
            $("#ready-message-opponent").text(opponent + " is ready!");
            // Disable animations
            $("#ready-message-opponent").css("animation-iteration-count", "unset");
        }
    });

    // Match start countdown
    socket.on("start countdown", function(player1, player2){
        $("#countdown-box").css("width", "100%");
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
                    $("#moves-col").css("border-left", "2px groove black");
                    $("#moves-col").css("border-right", "2px groove black");
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
        // Action 4: surrender
        // Action 5+: use item
    // Action priority
        // Use item
        // Surrender
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
            $("#player-action").text("You are ready for a heavy attack...");
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
            $("#player-action").text("You are ready to attack...");
            player_action = 2;
            socket.emit("player action", player, player_action);
            // Disable all interactions until next round
            disableActions();
        }
    });

    // Defend
    $("#player-defend").click(function(){
        $("#player-action").text("You are ready to block...");
        player_action = 3;
        socket.emit("player action", player, player_action);
        // Disable all interactions until next round
        disableActions();
    });

    // Surrender
    $("#player-concede").click(function(){
        $("#player-action").text("You decided to give up...");
        player_action = 4;
        socket.emit("player action", player, player_action);
        // Disable all interactions until next round
        disableActions();
    });
    
    // Use item
        // 5: heal
        // 6: empower
        // 7: sap
        // 8: fortify
    $(".dropdown-item").click(function() {
        
    });
    $(document).on('click', '.dropdown-item', function() {
        // This will work!
        $("#player-action").text("You are ready to use the item...");
        selected_item = $(this).text();
        console.log(selected_item);
        switch(selected_item) {
            case "heal": player_action = 5; break;
            case "empower": player_action = 6; break;
            case "sap": player_action = 7; break;
            case "fortify": player_action = 8; break;
        }
        socket.emit("player action", player, player_action);
        // Disable all interactions until next round
        disableActions();
    });

    // Opponent Actions
    socket.on("opponent action", function(playerX, action) {
        if (playerX == opponent) {
            opponent_action = action;
            $("#opponent-action").text(opponent + " is waiting for you to act");
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
                    setTimeout(opponentAction(opponent_action), 2000);
                }
            } else if (opponent_action > player_action) {
                opponentAction(opponent_action);
                end = checkEndCondition();
                if (end == 0) {
                    setTimeout(playerAction(player_action), 2000);
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
        $("#opponent-action").text("Waiting for opponent");
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
                // If one player fails to choose an action, the other player's action should make impact nevertheless
                if (player_action == 0) {
                    socket.emit("player action", player, player_action);
                } else if (opponent_action == 0) {
                    socket.emit("player action", opponent, opponent_action);
                } else {
                    newRound();
                }
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
        $("#opponent-action").text("Waiting for opponent");
        $("#player-result").text("");
        $("#opponent-result").text("");

        // Update round number
        round++;
        // Give item to players each 3 rounds
        if (round % 3 == 0) {
            $("#extra-message").text("Drawing new item!");
            getItem();
            setTimeout(function(){
                $("#extra-message").text("");
                replenishEnergy();
                roundCountdown();
                enableActions();
            }, 6000);
        } else {
            replenishEnergy();
            roundCountdown();
            enableActions();
        }
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

    function getItem() {
        // Generate random integer within array size
        let x = Math.floor(Math.random() * item_array_length);
        // Add random item to player array
        let new_item = items[x];
        player_items.push(new_item);

        // Append to html
        $("#item-dropdown").append("<li><a class='dropdown-item'>"+ new_item +"</a></li>");

        setTimeout(function(){
            $("#extra-message").text("You got " + new_item + "!");
        }, 3000);
    }

    
    function playerAction(player_action) {
        // Switch for player actions
        switch(player_action) {
            // case 0 is round missed
            case 0: miss("player");
                $("#player-action").text("You missed the round!");
                break;
            case 1: heavy("player");
                $("#player-action").text("You strike the enemy with force!");
                break;
            case 2: attack("player");
                $("#player-action").text("You are attacking!");
                break;
            case 3: defend("player");
                $("#player-action").text("You raised your shield!");
                break;
            case 4: surrender("player");
                $("#player-action").text("You ran away!");
                break;
            case 5: heal("player");
                $("#player-action").text("You used heal!");
                break;
            case 6: empower("player");
                $("#player-action").text("You used empower!");
                break;
            case 7: sap("player");
                $("#player-action").text("You used sap!");
                break;
            case 8: fortify("player");
                $("#player-action").text("You used fortify!");
                break;
        }
    }
    
    function opponentAction(opponent_action) {
        // Switch for opponent actions
        switch(opponent_action) {
            // case 0 is round missed
            case 0: miss("opponent");
                $("#opponent-action").text(opponent + " missed the round!");
                break;
            case 1: heavy("opponent");
                $("#opponent-action").text(opponent + " strikes with force!");
                break;
            case 2: attack("opponent");
                $("#opponent-action").text(opponent + " is attacking!");
                break;
            case 3: defend("opponent");
                $("#opponent-action").text(opponent + " raised their shield!");
                break;
            case 4: surrender("opponent");
                $("#opponent-action").text(opponent + " flees!");
                break;
            case 5: heal("opponent");
                $("#opponent-action").text(opponent + " used heal!");
                break;
            case 6: empower("opponent");
                $("#opponent-action").text(opponent + " used empower!");
                break;
            case 7: sap("opponent");
                $("#opponent-action").text(opponent + " used sap!");
                break;
            case 8: fortify("opponent");
                $("#opponent-action").text(opponent + " used fortify!");
                break;
        } 
    }
    
    // Actions and results

    function miss(playerX) {
        // Do nothing
    }

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
            receiver_action = opponent_action;
        } else {
            actor_hp = parseInt($("#opponent-hp-value").text());
            actor_ep = parseInt($("#opponent-ep-value").text());
            receiver_hp = parseInt($("#player-hp-value").text());
            receiver_ep = parseInt($("#player-ep-value").text());
            receiver_action = player_action;
        }

        // Update actor ep
        let actor_ep_value = actor_ep - 15;
        // Initialize actor/receiver hp
        let actor_hp_value;
        let receiver_hp_value;

        // Attack interrupted
        if (receiver_action == 2) {
            // Update actor hp (Stagger damage is a total of 15, with 5 from receivers logic and 10 from actor's logic)
            actor_hp_value = actor_hp - 5;
            if (actor == "player") {
                $("#opponent-result").append("You got staggered for 15 damage! <br>");
            } else {
                $("#player-result").append(opponent + " got staggered for 15 damage! <br>");
            }
        // Block bypassed
        } else if (receiver_action == 3){
            // Update receiver hp
            receiver_hp_value = receiver_hp - 5;
            if (actor == "player") {
                $("#player-result").append("You broke the opponent's block for 5 damage! <br>");
            } else {
                $("#opponent-result").append(opponent + " broke your block for 5 damage! <br>");
            }
        // Full swing
        } else {
            // Update receiver hp
            receiver_hp_value = receiver_hp - 20;
            if (actor == "player") {
                $("#player-result").append("You did a full swing at the opponent for 20 damage! <br>");
            } else {
                $("#opponent-result").append(opponent + " did a full swing at you for 20 damage! <br>");
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
            receiver_action = opponent_action;
        } else {
            actor_hp = parseInt($("#opponent-hp-value").text());
            actor_ep = parseInt($("#opponent-ep-value").text());
            receiver_hp = parseInt($("#player-hp-value").text());
            receiver_ep = parseInt($("#player-ep-value").text());
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
                $("#opponent-result").append(opponent + " blocked the attack! <br>");
            } else {
                $("#player-result").append("You blocked the attack! <br>");
            }
        } else {
            // Update receiver hp
            receiver_hp_value = receiver_hp - 10;
            if (actor == "player") {
                $("#player-result").append(opponent + " received 10 damage! <br>");
            } else {
                $("#opponent-result").append("You received 10 damage! <br>");
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
        // No code needed here
    }

    function surrender(playerX) {
        // Dynamic actor for both the player and opponent
        let actor = playerX;
        
        actor_hp = parseInt($("#player-hp-value").text());
        
        if (actor == "player") {
            $("#player-action").text("You have surrendered");
            $("#player-hp-value").text(0);
        } else {
            $("#opponent-action").text(opponent + " has surrendered");
            $("#opponent-hp-value").text(0);
        }
    }

    function heal(playerX) {
        let actor = playerX;
        // Initialize variables
        let actor_hp;

        if (actor == "player") {
            actor_hp = parseInt($("#player-hp-value").text());
        } else {
            actor_hp = parseInt($("#opponent-hp-value").text());
        }

        // Heal player for 10 HP
        actor_hp += 10;

        if (actor == "player") {
            $("#player-result").append("You received 10 HP back! <br>");
        } else {
            $("#opponent-result").append(opponent + " received 10 HP back! <br>");
        }

        // Prevent hp from going above 100
        if (actor_hp > 100) {
            actor_hp = 100;
        }
        // Create the string required to update the css "width" property
        let actor_hp_percent = actor_hp + "%";

        // Change css property
        if (actor == "player") {
            $("#player-hp").css("width", actor_hp_percent);
            $("#player-hp-value").text(actor_hp);
        } else {
            $("#opponent-hp").css("width", actor_hp_percent);
            $("#opponent-hp-value").text(actor_hp);
        }

    }

    function empower(playerX) {
        let actor = playerX;
    }

    function sap(playerX) {
        let actor = playerX;
    }

    function fortify(playerX) {
        let actor = playerX;
    }
    
    function useItem(playerX, itemX) {
        // TODO
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
        // Clear opponent cookie
        document.cookie = "opponent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

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
        // Clear opponent cookie
        document.cookie = "opponent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

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
        // Clear opponent cookie
        document.cookie = "opponent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

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

