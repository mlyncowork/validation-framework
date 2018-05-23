const assert = require("assert");
const asyncValidator = require("../asyncValidator")();
const helper = require("./helper");

describe("Implemented sanitizer functions", () => {
	it("should sanitize boolean values passed as string", async () => {
		const test_cases = [
			{data: {isValid: "true"}, rules: {"isValid": {isBoolean: true, sanitizer: "toBoolean"}}, hasErrors: false, message : "True passed as string is sanitized to boolean"},
		];
		await helper.run_test_cases(test_cases);
	});
});