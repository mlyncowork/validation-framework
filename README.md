# Asynchronous validator

[![Build Status](https://travis-ci.org/mlyncowork/validation-framework.svg?branch=master)](https://travis-ci.org/mlyncowork/validation-framework)

A small framework for validation of incoming JSON requests in Node.js.

## The problem

We were dealing with a problem of validation and sanitation of multiple REST API calls on the server side in a consistent, readable and DRY way. 

## Our solution

We provide a configurable framework, which requires two inputs: data as JSON object (possibly with nested JSON objects)
and rules as a path to validated property in data object and applied validations + sanitizers.

We use `*`(wildcard) operator in rule's path, which will apply the rule to all objects in path.

Our framework enables the user to use conditions in paths, so the rule will be applied conditionally on some other property in the data.

We are using this [validator](https://www.npmjs.com/package/validator) for most our default validation functions. All passed values are
converted to strings and one can use [validator](https://www.npmjs.com/package/validator) options. Options must be placed in settings property of the rule.

## Installation and Usage

Install the library with `npm install validator --save`.

Require the library with `const validator = require('validation-framework')()`.

## Validators

Here is a list of the available validators.

Validator                               | Description
--------------------------------------- | --------------------------------------
**isInt(value, params)**            | [Implemented by validator](https://www.npmjs.com/package/validator#validators)
**isString(value, params)**             | check if the value is unempty string
**isEmail(value, params)**             | [Implemented by validator](https://www.npmjs.com/package/validator#validators)
**isBoolean(value, params)**             | [Implemented by validator](https://www.npmjs.com/package/validator#validators)
**isAlpha(value, params)**             | [Implemented by validator](https://www.npmjs.com/package/validator#validators)
**isAlphanumeric(value, params)**             | [Implemented by validator](https://www.npmjs.com/package/validator#validators)
**isDecimal(value, params)**             | [Implemented by validator](https://www.npmjs.com/package/validator#validators)
**isDivisibleBy(value, params)**             | [Implemented by validator](https://www.npmjs.com/package/validator#validators)
**isEmpty(value, params)**             | [Implemented by validator](https://www.npmjs.com/package/validator#validators)
**isFloat(value, params)**             | [Implemented by validator](https://www.npmjs.com/package/validator#validators)
**isIn(value, params)**             | [Implemented by validator](https://www.npmjs.com/package/validator#validators)
**isNumeric(value, params)**             | [Implemented by validator](https://www.npmjs.com/package/validator#validators)
**isLength(value, params)**             | [Implemented by validator](https://www.npmjs.com/package/validator#validators)
**required(value)**             | check if the value exists 
**null(value)**             | enable the value to be null

### Example usage

Validator functions are invoked by path to property inside JSON data object. Optional arguments can be passed according to previous table.

	const rule = { 
	    "case.amount": { 
	        isInt: { 
    	    settings:{min:0, max: 2}
            }
        }
    }
    await asyncValidator.validate({"case": {"amount": 1}}, rule); // hasErrors: false

#### Register custom validator

You can add your own validator or override the default implementations. 

##### Solution to unique constraint validation

During update of the affected entity we must pass unique id of the entity in `params.id`.

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
    }
	await asyncValidator.registerValidator("uniqEmail", validator_function);
	const rule = { 
        "email": { 
            uniqEmail: {id: 1}
          }
    }
    await asyncValidator.validate({email: "foo@foo.com"}, rule); // hasErrors: false 
    
## Sanitizers

Here is a list of the available sanitizers.

Sanitizer                               | Description
--------------------------------------- | --------------------------------------
**toInt(value)**            | converts string to int using [parseInt](https://www.w3schools.com/jsref/jsref_parseint.asp)
**toNull(value)**             | converts string "null" to null
**toFloat(value)**             |  converts string to float using [parseFloat](https://www.w3schools.com/jsref/jsref_parseFloat.asp)
**toBoolean(value)**             | converts string "true" to true and string "false" to false 
**toJson(value)**             | converts string to JSON object using [JSON.parse](https://www.w3schools.com/js/js_json_parse.asp)

### Example usage

    const rule = {
        "property": {
            sanitizer: "registeredSanitizerName",
        }
    }

#### Custom sanitizer

    const sanitizer_function = async function (value) {
        try {
            return new Date(value).toISOString();
        } catch (err) {
            return value;
        }
    };
    await asyncValidator.registerSanitizer("toISOString", sanitizer_function);
    const rule = {
        "date": {
            sanitizer: "toISOString",
            isIn: {
                settings:["2011-10-05T14:48:00.000Z"]
            }, 
        }
    }


## Default sanitizers

Here is a default configuration.

Validator                               | Default sanitizer
--------------------------------------- | --------------------------------------
**isInt**            | **toInt**
**isFloat**             | **toFloat**
**isBoolean**             | **toBoolean**
**isJson**             | **toJson**
**null**             | **toNull**

### Example usage

When the sanitizer is registered we can set it as default for any validation function.

    asyncValidator.setDefautlSanitizer("isDate", ["toISOString"]);

## Operands and conditions

Here is a list of the available operands.

Operand                               | Description
--------------------------------------- | --------------------------------------
**inArray(property, value)**            | check if the given property is in array of values
**===(property, value)**             | check if the given property equals to value
**exist(property, value)**             | check if the given property exists(is not undefined)
**object-keys-equals(property, value)**             | check if the object has exact amount of properties

By default the validator will flatten the data in condition, if you do not want this behaviour than set `condition.unflattened` to true.

### Example usage
    const rules = {
            "number": {
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
           }
     }
     
     await asyncValidator.validate({case: {status: "closed"}, number: 1}, rule); // hasErrors: false
     await asyncValidator.validate({case: {status: "new"}, number: -1}, rule); // hasErrors: false
     await asyncValidator.validate({case: {status: "new"}, number: 1}, rule); // hasErrors: true
     
#### Custom operand
    const operand = async function (property, value) {
		return property > value;
	};
	asyncValidator.registerOperand(">", operand);
	
	const rules = {
        "case.income_confirmation": {
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
        }
    }
    
    await asyncValidator.validate({case: {amount: 5001}}, rule); // hasErrors: true
    await asyncValidator.validate({case: {amount: 5001, income_confirmation: {} }}, rule); // hasErrors: false
    await asyncValidator.validate({case: {amount: 4999}}, rule); // hasErrors: false
    
## Wildcards

When you want to apply to same rules for all keys of some object you can use `*` character.

    const rules = {
        "case.clients.*.age": { // for every client set validator of age property
            if: [
                {
                    condition: {
                        property: "case.clients.*.family_status", // depending on the particular client family_status property
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
        }
    }
    
    await asyncValidator.validate({case: {clients: { id_1: { family_status: "married", age: 21},
                                                     id_2: { family_status: "married", age: 17 }}, // this field will have an error
                                                     rules); // hasErrors: true
    await asyncValidator.validate({case: {clients: { id_1: { family_status: "married", age: 21},
                                                     id_2: { family_status: "married", age: 22 }},
                                  	                 rules); // hasErrors: false

     
## Error messages

The validator follows common pattern for emitting errors as translatable strings.   
    
    {
        hasErrors: true // false if no errors
        errors: { // if hasErrors === false then empty object
            "email1" : { // name of field with errors
                "messages": [ // array of all failed validators
                    { validator: "isEmail", message: "E_validation_error_isEmail"} // message to translate 
                ]
            },
            "email2" : 
                "messages": [
                    { validator: "uniqEmail", message: "E_validation_error_uniqEmail"}  
                ]
        }
        values: {
            "email1": "foo.com",
            "email2": "foo@bar.com"
        }
    }