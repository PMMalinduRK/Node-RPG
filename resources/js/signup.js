$(function(){
    const localUrl = "http://localhost:3000";
    const pubUrl = "https://node-rpg.onrender.com";

    $("#btn-signup").click(function(){
  
        let username = $("#username").val();
        let email = $("#email").val();
        let password = $("#password").val();
        // TODO confirm password

        $.ajax({
            type: "POST",
            url: localUrl + "/api/auth/signup",
            data: JSON.stringify({ "username": username, "email": email, "password" : password }),
            contentType: "application/json",
            success: function (result) {
                console.log(result);
            },
            error: function (result, status) {
                console.log(result);
            }
        });

        document.cookie = "player="+encodeURIComponent(username);
        window.location.href = "/main";
    });
});