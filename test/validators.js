const assert = require("assert");
const asyncValidator = require("../index")();
const helper = require("./helper");

describe("Implemented validator functions", () => {
	it("should validate emails", async () => {
		const test_cases = [
			{data: {email:"foo"}, rules: {"email": {isEmail: true}}, hasErrors: true, message : "Correct email"},
			{data: {email:"foo@foo.com"}, rules: {"email": {isEmail: true}}, hasErrors: false, message : "Wrong email"}
		];
		await helper.run_test_cases(test_cases);
	});
});