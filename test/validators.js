const assert = require("assert");
const asyncValidator = require("../asyncValidator")();

describe('Implemented validator functions', () => {
    it('should validate emails', async () => {
        const test_cases = [
            {data: {email:"foo"}, rules: {"email": {isEmail: true}}, hasErrors: true, message : "Correct email"},
            {data: {email:"foo@foo.sk"}, rules: {"email": {isEmail: true}}, hasErrors: false, message : "Wrong email"}
        ];
        for (const test_case of test_cases) {
            assert.equal((await asyncValidator.validate(test_case.data, test_case.rules)).hasErrors, test_case.hasErrors, test_case.message);
        }
    });
});