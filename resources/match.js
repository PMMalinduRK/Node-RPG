$(window).on("load", function() {
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
    $("#join-message").text(player+" has joined the game");
})