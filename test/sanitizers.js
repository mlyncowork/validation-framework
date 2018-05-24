const assert = require("assert");
const asyncValidator = require("../asyncValidator")();
const helper = require("./helper");

describe("Implemented sanitizer functions", () => {
	it("should sanitize boolean values passed as string", async () => {
		const test_cases = [
			{data: {isValid: "true"}, rules: {"isValid": {isBoolean: true, sanitizer: "toBoolean"}}, hasErrors: false, message : "True passed as string is sanitized to boolean"},
		];
		console.log(await asyncValidator.validate(test_cases[0].data, test_cases[0].rules));
		console.log((await asyncValidator.validate(test_cases[0].data, test_cases[0].rules)).errors.isValid);
		await helper.run_test_cases(test_cases);
	});


});