const assert = require("assert");
const asyncValidator = require("../asyncValidator")();
const _ = require("lodash");
const helper = require("./helper");

describe("Create and register your own operand", () => {
	it("should be able to register a custom operand", async () => {
		const operand = async function (property, value) {
			return property > value;
		};
		asyncValidator.registerOperand(">", operand);
	});

	it("should be able to use a custom operand", async () => {
		const if_condition = {
			if: [
				{
					condition: {
						property: "case.amount",
						operand: ">",
						value: 5000
					},
					rules: {
						required: true
					}
				}
			]
		};
		const test_cases = [
			{data: {case: {amount: 5001}}, rules: {"case.income_confirmation": if_condition},
				hasErrors: true, message : "."},
			{data: {case: {amount: 5001, income_confirmation: {} }}, rules: {"case.income_confirmation": if_condition},
				hasErrors: false, message : "."},
			{data: {case: {amount: 4999}}, rules: {"case.income_confirmation": if_condition},
				hasErrors: false, message : "."}
		];
		await helper.run_test_cases(test_cases);
	});
});