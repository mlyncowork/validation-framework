const assert = require("assert");
const helper = require("./helper");

describe("Implemented operands", () => {
	it("should validate value using a condition on another value in the same JSON using inArray operator", async () => {
		const if_condition = {
			if: [
				{
					condition: {
						property: "case.status",
						operand: "inArray",
						value: ["closed", "canceled"]
					},
					rules: {
						isInt:{
							settings:{min:0, max: 2}
						}
					}
				},
				{
					condition: {
						property: "case.status",
						operand: "inArray",
						value: ["new", "submitted"],
					},
					rules: {
						isInt: {
							settings: {min: -2, max: 0}
						}
					}
				}

			]
		};
		const test_cases = [
			{data: {case: {status: "closed"}, number: 1}, rules: {"number": if_condition},
				hasErrors: false, message : "When some entity has status closed. than number must be greater than zero."},
			{data: {case: {status: "new"}, number: -1}, rules: {"number": if_condition},
				hasErrors: false, message : "When some entity has status new. than number must be lower than zero."},
			{data: {case: {status: "new"}, number: 1}, rules: {"number": if_condition},
				hasErrors: true, message : "When some entity has status new. than number must not be greater than zero."}
		];

		await helper.run_test_cases(test_cases);
	});

	it("should validate a set of values with a wildcard operator using === operator", async () => {
		const if_condition = {
			if: [
				{
					condition: {
						property: "case.clients.*.family_status",
						operand: "===",
						value: "married"
					},
					rules: {
						isInt: {
							settings: {min:18}
						}
					}
				},
			]
		};
		const test_cases = [
			{data: {
			    case: {
					clients: {
			            id_1: {
							family_status: "married",
							age: 21
						},
						id_2: {
							family_status: "married",
							age:22
						}
					}

				}}, rules: {"case.clients.*.age": if_condition},
			hasErrors: false, message : "When any client have family_status equal to married, than his age must be greater than 18."},
			{data: {
				case: {
					clients: {
						id_1: {
							family_status: "married",
							age: 21
						},
						id_2: {
							family_status: "married",
							age:17
						}
					}

				}}, rules: {"case.clients.*.age": if_condition},
			hasErrors: true, message : "When any client have family_status equal to married, than his age must not be lower than 18."}
		];

		await helper.run_test_cases(test_cases);
	});

});