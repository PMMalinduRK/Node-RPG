$(function(){
    // Local URL
    /* const hostUrl = "http://localhost:3000"; */
    // Render URL
    const hostUrl = "https://node-rpg.onrender.com";

    $("#btn-login").click(function(){
        // Initialize booleans for validation
        let usernameValid, passwordValid = false;

        let username = $("#username").val();
        let password = $("#password").val();

        // Validate username and password only if fields are not empty
        if(username == "") {
            $("#username-feedback").text("Username cannot be empty");
        } else {
            usernameValid = true;
            $("#username-feedback").text("");
        }

        if(password == "") {
            $("#password-feedback").text("Password cannot be empty");
        } else {
            passwordValid = true;
            $("#password-feedback").text("");
        }

        // Do the post request only if all fields are valid
        if (usernameValid && passwordValid) {
            // POST request to the api
            $.ajax({
                type: "POST",
                url: hostUrl + "/api/auth/signin",
                data: JSON.stringify({ "username": username, "password" : password }),
                contentType: "application/json",
                success: function (result) {
                    console.log(result);
                    // GET the response and set it to the header of user api
                    $.ajax({
                        type : "GET", 
                        url : hostUrl + "/api/test/user", 
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
                    $("#username-feedback").text("Invalid username or password");
                    $("#password-feedback").text("Invalid username or password");
                }
            });
        }

        document.cookie = "player="+encodeURIComponent(username);
    });
});