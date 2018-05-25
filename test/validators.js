const assert = require("assert");
const asyncValidator = require("../index")();
const helper = require("./helper");

describe("Implemented validator functions", () => {
	it("should validate emails", async () => {
		const test_cases = [
			{data: {email:"foofoo.com"}, rules: {"email": {isEmail: true}}, hasErrors: true, message : "Missing @ in the email"},
			{data: {email:"foo@foo.com"}, rules: {"email": {isEmail: true}}, hasErrors: false, message : "Correct email in name@address.domain format"}
		];
		await helper.run_test_cases(test_cases);
	});
});