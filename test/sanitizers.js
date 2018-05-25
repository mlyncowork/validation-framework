const assert = require("assert");
const asyncValidator = require("../index")();
const helper = require("./helper");

describe("Implemented sanitizer functions", () => {
	it("should sanitize boolean values passed as string", async () => {
		const test_cases = [
			{data: {isValid: "true"}, rules: {"isValid": {isBoolean: true, sanitizer: "toBoolean"}}, hasErrors: false, message : "String true wil be sanitized to boolean value true"},
		];
		await helper.run_test_cases(test_cases);
	});


});