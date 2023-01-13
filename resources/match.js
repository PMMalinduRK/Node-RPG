$(function() {
    // Fetch player name from cookie
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

    $("#join-message-player").text(player+" has joined the game");
    $("#join-message-opponent").text(player2+" has joined the game");
});