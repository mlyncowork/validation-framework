const assert = require("assert");
const asyncValidator = require("../asyncValidator")();

describe('Implemented sanitizer functions', () => {
    it('should sanitize boolean values passed as string', async () => {
        const test_cases = [
            {data: {isValid: "true"}, rules: {"isValid": {isBoolean: true, sanitizer: "toBoolean"}}, hasErrors: false, message : "True passed as string is sanitized to boolean"},
        ];
        for (const test_case of test_cases) {
            assert.equal((await asyncValidator.validate(test_case.data, test_case.rules)).hasErrors, test_case.hasErrors, test_case.message);
        }
    });
});