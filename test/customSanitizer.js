const assert = require("assert");
const asyncValidator = require("../index")();
const _ = require("lodash");
const helper = require("./helper");

describe("Create and register your own sanitizer", () => {

	let test_date = new Date("05 October 2011 14:48 UTC").toString();
	let test_ISO_date = "2011-10-05T14:48:00.000Z";

	it("should be able to register a custom sanitizer", async () => {
		const sanitizer_function = async function (value) {
			try {
				return new Date(value).toISOString();
			} catch (err) {
				return value;
			}
		};
		asyncValidator.registerSanitizer("toISOString", sanitizer_function);
	});

	it("should be able to use a custom sanitizer", async () => {

		const test_cases = [
			{data: {date: test_date}, rules: {"date": {sanitizer: "toISOString", isIn: {settings:[test_ISO_date]}, }},
				hasErrors: false, message : "Custom sanitizer is explicitly used"},
		];
		await helper.run_test_cases(test_cases);
	});

	it("should be able to bind custom sanitizer as default to any validator", async () => {
		asyncValidator.setDefautlSanitizer("isDate", ["toISOString"]);

		const test_cases = [
			{data: {date: test_date}, rules: {"date": {isDate: "true", isIn: {settings:[test_ISO_date]}, }},
				hasErrors: false, message : "Custom sanitizer is set as default and used implicitly"},
		];
		await helper.run_test_cases(test_cases);
	});
});