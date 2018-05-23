# Asynchronous validator

A small framework for validation of incoming JSON requests in Node.js.

## The problem

We were dealing with a problem of validation and sanitation of multiple REST API calls on the server side in a consistent, readable and DRY way. 

## Our solution

We provide a configurable framework, which requires two inputs: data as JSON object (possibly with nested JSON objects)
and rules as a path to validated property in data object and applied validations + sanitizers.

We implemented wildcard (*) operator in rule's path, which will apply the rule to all objects in path.

We also implemented conditions in paths, that the rule will be applied conditionally on some other property in the data.


We are using [validator.js](https://www.npmjs.com/package/validator) for most our default validation functions. All passed values are
converted to strings and one can use [validator.js](https://www.npmjs.com/package/validator) options, but options must be placed in settings property of the rule.
 

## Installation and Usage

Install the library with `npm install validator`.

## Validators

Here is a list of the available validators.

Validator                               | Description
--------------------------------------- | --------------------------------------
**isInt(params)**            | check if the string contains the seed.
**isString(params)**             | check if the string matches the comparison.
**isEmail(params)**             | check if the string matches the comparison.
**isBoolean(params)**             | check if the string matches the comparison.
**isAlpha(params)**             | check if the string matches the comparison.
**isAlphanumeric(params)**             | check if the string matches the comparison.
**isDecimal(params)**             | check if the string matches the comparison.
**isDivisibleBy(params)**             | check if the string matches the comparison.
**isEmpty(params)**             | check if the string matches the comparison.
**isFloat(params)**             | check if the string matches the comparison.
**isIn(params)**             | check if the string matches the comparison.
**isNumeric(params)**             | check if the string matches the comparison.
**isLength(params)**             | check if the string matches the comparison.

TODO register

## Sanitizers

Here is a list of the available sanitizers.

Sanitizer                               | Description
--------------------------------------- | --------------------------------------
**toInt(value)**            | check if the string contains the seed.
**toNull(value)**             | check if the string matches the comparison.
**toFloat(value)**             | check if the string matches the comparison.
**toBoolean(value)**             | check if the string matches the comparison.
**toJson(value)**             | check if the string matches the comparison.

## Default sanitizers

Validator                               | Default sanitizer
--------------------------------------- | --------------------------------------
**tInt**            | **toInt**
**isFloat**             | **toFloat**
**isBoolean**             | **toBoolean**
**isJson**             | **toJson**
**null**             | **toNull**

TODO register

let DefaultSanitizers = {
	isInt:["toInt"],
	isFloat:["toFloat"],
	isBoolean:["toBoolean"],
	isJson:["toJson"],
	null:["toNull"]
};
