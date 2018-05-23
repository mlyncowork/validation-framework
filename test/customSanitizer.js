const assert = require("assert");
const asyncValidator = require("../asyncValidator")();
const _ = require("lodash");
const helper = require("./helper");

describe("Create and register your own sanitizer", () => {
	it("should be able to register a custom sanitizer", async () => {
		const sanitizer_function = async function (value) {
			try {
				return new Date(value).toISOString();
			} catch (err) {
				return value;
			}
		};
		await asyncValidator.registerSanitizer("toISOString", sanitizer_function);
	});

	it("should be able to use a custom sanitizer", async () => {
		let date = new Date("05 October 2011 14:48 UTC").toString();

		const test_cases = [
			{data: {date: date}, rules: {"date": {sanitizer: "toISOString", isIn: {settings:["2011-10-05T14:48:00.000Z"]}, }},
				hasErrors: false, message : "."},
		];
		await helper.run_test_cases(test_cases);
	});
});