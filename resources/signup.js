$(function(){
    $("#btn-signup").click(function(){
  
        let username = $("#username").val();
        let email = $("#email").val();
        let password = $("#password").val();
        // TODO confirm password

        $.ajax({
            type: "POST",
            url: "http://localhost:3000/api/auth/signup",
            data: JSON.stringify({ "username": username, "email": email, "password" : password }),
            contentType: "application/json",
            success: function (result) {
                console.log(result);
            },
            error: function (result, status) {
                console.log(result);
            }
        });

        document.cookie = "player="+username;
        window.location.href = "/main";
    });
});