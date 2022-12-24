$(function(){
    $("#btn-login").click(function(){
        let player_id = $("#player-id").val();

        document.cookie = "player="+player_id;
        window.location.href = "/main";
    });
});
