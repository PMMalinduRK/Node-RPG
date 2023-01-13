// TODO put all ajax calls in separate functions
$(function(){
    // Initialize variables for later use
    let player_id;
    let lobby_message;
    let player_count;
    //let socket = io("http://localhost:3000");
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
    $("#welcome-msg").text("Welcome "+player+"!");
    //

    $("#play").click(function(){
        // Disable play button if looking for a match
        $(this).prop('disabled', true);
        $("#welcome-msg").text("Searching for players...");
        $("#cancel-matchmaking").show();

        // Add player to the waiting lobby
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/api/lobby",
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

    $("#cancel-matchmaking").click(function(){
        $("#play").prop('disabled', false);
        $("#welcome-msg").text("Welcome "+player+"!");
        $("#cancel-matchmaking").hide();

        // Remove player from the waiting lobby
        $.ajax({
            type: "DELETE",
            url: "http://localhost:3000/api/lobby/"+player_id,
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
            url: "http://localhost:3000/api/lobby/count/players",
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

    socket.on("enter match", function(player1, player2){
        // Send only the relevent two players into the match
        if(player1 == player || player2 == player){
            console.log(player1 + " vs " + player2);
            // Remove player from the waiting lobby
            $.ajax({
                type: "DELETE",
                url: "http://localhost:3000/api/lobby/"+player_id,
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
                document.cookie = "player2="+encodeURIComponent(player2);
            } else {
                document.cookie = "player2="+encodeURIComponent(player1);
            }
            // Load match
            window.location.href = "/match";
        }
    })
});