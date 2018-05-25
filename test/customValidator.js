const assert = require("assert");
const asyncValidator = require("../index")();
const _ = require("lodash");
const helper = require("./helper");

describe("Create and register your own validator", () => {
	it("should be able to register a custom validator", async () => {
		const validator_function = async function (value, params) {
			try {
				const database_rows = [{id: 1, email: "foo@bar.com"}, {id: 2, email: "bar@foo.com"}];

				const rows = _.filter(database_rows, {"email": value});

				if (rows.length === 0) {
					return true;
				}

				if (params.id && rows.length === 1 && (params.id === rows[0].id)) {
					return true;
				}

				return false;
			} catch (err) {
				return false;
			}
		};
		asyncValidator.registerValidator("uniqEmail", validator_function);
	});

	it("should be able to use a custom validator", async () => {
		const test_cases = [
			{data: {email: "foo@bar.com"}, rules: {"email": {uniqEmail: true}},
				hasErrors: true, message : "Given email is already taken"},
			{data: {email: "foo@bar.com"}, rules: {"email": {uniqEmail: {id: 1}}},
				hasErrors: false, message : "Given email is taken by the entity with expected id"},
			{data: {email: "foo@foo.com"}, rules: {"email": {uniqEmail: true}},
				hasErrors: false, message : "New email is saved"},

		];
		await helper.run_test_cases(test_cases);
	});
});