const assert = require("assert");
const asyncValidator = require("../asyncValidator")();
const _ = require('lodash');

describe('Create and register your own validator', () => {
    it('should be able to register a custom validator', async () => {
        const validator_function = async function (value, params) {
            try {
                const database_rows = [{id: 1, email: "foo@bar.com"}, {id: 2, email: "bar@foo.com"}];

                const rows = _.filter(database_rows, {'email': value});

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
        await asyncValidator.registerValidator('uniqEmail', validator_function);
    });

    it('should be able to use a custom validator', async () => {
        const test_cases = [
            {data: {email: "foo@bar.com"}, rules: {"email": {uniqEmail: true}},
                hasErrors: true, message : "When some entity already has given email."},
            {data: {email: "foo@bar.com"}, rules: {"email": {uniqEmail: {id: 1}}},
                hasErrors: false, message : "When some entity already has given email, but we pass id of this entity."},
            {data: {email: "foo@foo.com"}, rules: {"email": {uniqEmail: true}},
                hasErrors: false, message : "When we pass a completely new email."},

        ];
        for (const test_case of test_cases) {
            assert.equal((await asyncValidator.validate(test_case.data, test_case.rules)).hasErrors, test_case.hasErrors, test_case.message);
        }
    });


});