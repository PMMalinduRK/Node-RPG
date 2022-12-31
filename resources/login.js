$(function(){

  let socket = io("http://localhost:3000");

    $("#btn-login").click(function(){

        let username = $("#username").val();
        let password = $("#password").val();

        socket.emit("user auth", username, password);

        document.cookie = "player="+username;
        window.location.href = "/main";
    });
});
