const assert = require("assert");
const asyncValidator = require("../asyncValidator")();

describe('Implemented operands', () => {
    it('should validate value using a condition on another value in the same JSON', async () => {
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
        for (const test_case of test_cases) {
            assert.equal((await asyncValidator.validate(test_case.data, test_case.rules)).hasErrors, test_case.hasErrors, test_case.message);
        }
    });
});