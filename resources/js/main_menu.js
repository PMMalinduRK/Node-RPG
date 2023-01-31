// TODO put all ajax calls in separate functions
$(function(){
    // Local URL
    const hostUrl = "http://localhost:3000";
    // Render URL
    /* const hostUrl = "https://node-rpg.onrender.com"; */
    // Initialize variables for later use
    let player_id;
    let lobby_message;
    let player_count;
    var socket = io();

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

    // If the player is undefined, send to redirect page
    if (player == undefined) {
        window.location.href = "/redirect";
    } else {
        document.getElementsByTagName("html")[0].style.visibility = "visible";
    }

    $("#welcome-msg").text("Welcome "+player+"!");


    $("#btn-logout").click(function() {
        // Expire player cookie by giving it a past expiry date
        document.cookie = "player=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // Send back to login page
        window.location.href = "/";
    })

    $("#btn-play").click(function(){
        // Disable play button if looking for a match
        $(this).prop('disabled', true);
        $("#welcome-msg").text("Searching for players...");
        $("#cancel-matchmaking").show();
        // Change sizes of the grid
        $("#nav-panel").css("height", "50%");
        $("#info-panel").css("height", "50%");

        // Add player to the waiting lobby
        $.ajax({
            type: "POST",
            url: hostUrl + "/api/lobby",
            data: JSON.stringify({ "username": player }),
            contentType: "application/json",
            success: function (result) {
                // console.log(result);
                player_id = result._id;
                // Show the number of players in lobby
                socket.emit("player waiting", player);
            },
            error: function (result, status) {
                // console.log(result);
            }
        });
    });

    // Trigger cancel matchmaking on page refresh as well
    $("#cancel-matchmaking").click(function(){
        $("#btn-play").prop('disabled', false);
        $("#welcome-msg").text("Welcome "+player+"!");
        $("#cancel-matchmaking").hide();
        // Change sizes of the grid back to default
        $("#nav-panel").css("height", "75%");
        $("#info-panel").css("height", "25%");

        // Remove player from the waiting lobby
        $.ajax({
            type: "DELETE",
            url: hostUrl + "/api/lobby/"+player_id,
            success: function (result) {
                // console.log(result);
                // Show the number of players in lobby
                socket.emit("player exited matchmaking", player);
            },
            error: function (result, status) {
                // console.log(result);
            }
        });
    });

    socket.on("Recount lobby", function(){
        console.log("Recounting lobby");
        // Show the number of players in lobby
        $.ajax({
            type: "GET",
            url: hostUrl + "/api/lobby/count/players",
            contentType : 'application/json',
            dataType : 'json',
            success: function (result) {
                console.log(result);
                lobby_message = result.message;
                player_count = result.count;
                // Update text on the number of players in lobby
                $("#players-lfm").text(lobby_message);
                // Connect to match if there are 2 players
                if(player_count == "2"){
                    console.log("Logged "+player);
                    socket.emit("match found", player);
                }
            },
            error: function (result, status) {
                console.log(result);
                $("#players-lfm").text(result.responseJSON.message);
            }
        });
    });

    socket.on("enter match", function(player1, player2, match_id){
        $("#players-lfm").hide();
        $("#welcome-msg").text("Match found!");
        setTimeout(function(){
            $("#welcome-msg").text("Connecting to match...");
        }, 2000);
        // Send only the relevent two players into the match
        if(player1 == player || player2 == player){
            console.log(player1 + " vs " + player2);
            // Remove player from the waiting lobby
            $.ajax({
                type: "DELETE",
                url: hostUrl + "/api/lobby/"+player_id,
                success: function (result) {
                    // console.log(result);
                    // Show the number of players in lobby
                    socket.emit("player exited matchmaking", player);
                },
                error: function (result, status) {
                    // console.log(result);
                }
            });
            if(player1 == player){
                document.cookie = "opponent="+encodeURIComponent(player2);
            } else {
                document.cookie = "opponent="+encodeURIComponent(player1);
            }
            document.cookie = "match_id="+encodeURIComponent(match_id);
            // Load match
            setTimeout(function(){
                window.location.href = "/match";
            }, 3000);
        }
    })
});