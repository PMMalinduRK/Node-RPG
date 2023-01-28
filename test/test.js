// Requiring module
const fs = require("fs");
const path = require("path");
const assert = require('assert');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

describe("login.html test", () => {
    const filePath = path.join(__dirname, "../resources/html/login.html");
    const html = fs.readFileSync(filePath, "utf-8");
    const dom = new JSDOM(html);
    const input_user = dom.window.document.querySelector("#username");
    const input_pass = dom.window.document.querySelector("#password");
    const button_login = dom.window.document.querySelector("#btn-login");

    before(() => {
        //This part executes once before all tests
    });

    after(() => {
        //This part executes once after all tests
    });

    // We can add nested blocks for different tests
    describe("Username field", () => {
        beforeEach(() => {
            //executes before every test
        });

        it("should have an empty field when the page loads", () => {
            assert.strictEqual(input_user.value, "");
        });
        
        it("should update the value when the value attribute is changed", () => {
            input_user.setAttribute("value", "Mark");
            assert.strictEqual(input_user.value, "Mark");
        });
    });

    describe("Password field", () => {
        beforeEach(() => {
            //executes before every test
        });

        it("should have an empty field when the page loads", () => {
            assert.strictEqual(input_pass.value, "");
        });
        
        it("should update the value when the value attribute is changed", () => {
            input_pass.setAttribute("value", "password");
            assert.strictEqual(input_pass.value, "password");
        });
    });

    describe("Login button", () => {
        /* it("should be enable when the page loads", () => {
            assert.strictEqual(button.hasAttribute("disabled"), false);
        });
        it("should be clickable", () => {
            button_login.removeAttribute("disabled");
            assert.strictEqual(button_login.getAttribute("disabled"), "");
        }); */
    });

    /* it("Is returning 6 when multiplying 2 * 3", () => {
        assert.equal(2*3, 6);
    });

	it("Is returning 4 when adding 2 + 2", () => {
	expect(2 + 2).to.equal(4);
	});

	it("Is returning boolean value as true", () => {
	expect(5 == 5).to.be.true;
	});
	
	it("Are both the sentences matching", () => {
	expect("This is working").to.equal('This is working');
	}); */
});
