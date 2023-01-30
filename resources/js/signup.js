$(function(){
    // Local URL
    //const hostUrl = "http://localhost:3000";
    // Render URL
    const hostUrl = "https://node-rpg.onrender.com";

    $("#btn-signup").click(function(){
        // Initialize booleans for validation
        let usernameValid, emailValid, passwordValid, cpasswordValid = false;
  
        let username = $("#username").val();
        let email = $("#email").val();
        let password = $("#password").val();
        let cpassword = $("#c_password").val();

        // Validate username and password only if fields are not empty
        if(username == "") {
            $("#username-feedback").text("Username cannot be empty");
        } else {
            usernameValid = true;
            $("#username-feedback").text("");
        }

        if(email == "") {
            $("#email-feedback").text("Email cannot be empty");
        } else if (isEmail(email)) {
            emailValid = true;
            $("#email-feedback").text("");
        } else {
            $("#email-feedback").text("Invalid email");
        }

        if(password == "") {
            $("#password-feedback").text("Password cannot be empty");
        } else {
            passwordValid = true;
            $("#password-feedback").text("");
        }

        if(cpassword == "") {
            $("#cpassword-feedback").text("Please confirm password");
        } else if(cpassword == password) {
            cpasswordValid = true;
            $("#cpassword-feedback").text("");
        } else {
            $("#cpassword-feedback").text("Passwords do not match");
        }

        // Do the post request only if all fields are valid
        if (usernameValid && emailValid && passwordValid && cpasswordValid) {
            $.ajax({
                type: "POST",
                url: hostUrl + "/api/auth/signup",
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
        }
    });

    // Regex function
    function isEmail(email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    }
});