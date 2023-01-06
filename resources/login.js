$(function(){

    $("#btn-login").click(function(){
        let username = $("#username").val();
        let password = $("#password").val();

        // POST request to the api
        $.ajax({
            type: "POST",
            url: "http://localhost:3000/api/auth/signin",
            data: JSON.stringify({ "username": username, "password" : password }),
            contentType: "application/json",
            success: function (result) {
                console.log(result);
                // GET the response and set it to the header of user api
                $.ajax({
                    type : "GET", 
                    url : "http://localhost:3000/api/test/user", 
                    beforeSend: function(xhr){xhr.setRequestHeader('x-access-token', result.accessToken);},
                    success : function(result) { 
                        console.log(result);
                        // Send user to the main menu if authentication passed
                        document.cookie = "player="+username;
                        window.location.href = "/main";
                    }, 
                    error : function(result) { 
                    //handle the error 
                    } 
                })
            },
            error: function (result, status) {
                console.log(result);
            }
        });

        document.cookie = "player="+username;
        //window.location.href = "/api/test/user";
    });
});