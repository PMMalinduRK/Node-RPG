suite("Login", function(){
    teardown(function(){
        $("#username").val("");
        $("#password").val("");
    });

    test("Login button click test", function(){
        let user = "Mark";
        $("#username").val(user);
        // The button gets clicked sometimes but not all the time
        document.getElementById("btn-login").click();
        let expected = "Hello " + name;
        // We need to use .text() instead of .val() for paragraph tags
        let actual = $("#helloText").text();

        chai.assert.equal(actual, expected, "The button click event should change the output label");
    });
});