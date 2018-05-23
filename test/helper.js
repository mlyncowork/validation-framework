const assert = require("assert");
const asyncValidator = require("../asyncValidator")();
const _ = require("lodash");

const helper = {
	run_test_cases: async function(test_cases) {
		for (const test_case of test_cases) {
			assert.equal((await asyncValidator.validate(test_case.data, test_case.rules)).hasErrors, test_case.hasErrors, test_case.message);
		}
	}
};

module.exports = helper;