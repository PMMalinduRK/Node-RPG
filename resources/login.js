$(function(){
    $("#btn-login").click(function(){
        let socket = io("http://localhost:3000");

        let player_id = $("#player-id").val();

        //socket.emit("new player", player_id);

        document.cookie = "player="+player_id;
        window.location.href = "/match";
    });
});
