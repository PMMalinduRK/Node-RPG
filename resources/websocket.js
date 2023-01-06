//const port = process.env.PORT || 3000;

$(function() {
    console.log("websocket working");

    let socket = io();

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
});