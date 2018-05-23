const _ = require("lodash");
const validator = require("validator");
const dot = require("dot-object");

let Operands = {
	"inArray": async function(property, value){
		return value.indexOf(property) >= 0;
	},
	"===": async function(property, value){
		return property === value;
	},
	"object-keys-equals" : async function(property, value){
		return Object.keys(property).length === value;
	},
	"exist":async function(property, value){
		return typeof property !== "undefined";
	}
}

let Validators = {
	isArray: async function(value, params){
		//TODO:
		return true;
	},
	isInt: async function(value, params){
		return validator.isInt(value.toString(), params.settings ? params.settings : undefined);
	},
	isString: async function(value, params){
		return !validator.isEmpty(value.toString());
	},
	isJson: async function(value, params){
		//TODO:
		return true;
		//return validator.isJSON(value);
	},
	isEmail: async function(value, params){
		return validator.isEmail(value.toString(), params.settings ? params.settings : undefined);
	},
	isBoolean: async function(value, params){
		return validator.isBoolean(value.toString());
	},
	isAlpha: async function(value, params){
		return validator.isAlpha(value.toString(), params.settings ? params.settings : undefined);
	},
	isAlphanumeric: async function(value, params){
		return validator.isAlphanumeric(value.toString(), params.settings ? params.settings : undefined);
	},
	isAscii: async function(value, params){
		return validator.isAscii(value.toString());
	},
	isBefore: async function(value, params){
		return validator.isBefore(value.toString(), params.settings ? params.settings : undefined);
	},
	isDecimal: async function(value, params){
		return validator.isDecimal(value.toString());
	},
	isDivisibleBy: async function(value, params){
		return validator.isDivisibleBy(value.toString(), params.settings ? params.settings : undefined);
	},
	isDate: async function(value, params){
		//TODO:
		return true;
	},
	isEmpty: async function(value, params){
		return validator.isEmpty(value.toString());
	},
	isFloat: async function(value, params){
		return validator.isFloat(value.toString(), params.settings ? params.settings : undefined);
	},
	isIn: async function(value, params){
		return validator.isIn(value.toString(), params.settings ? params.settings : undefined);
	},
	isNumeric: async function(value, params){
		return validator.isNumeric(value.toString());
	},
	isLength: async function(value, params){
		return validator.isLength(value.toString(), params.settings ? params.settings : undefined);
	}
};

let Sanitizers = {
	toNull : async function(value){
		if(value === "null"){
			return null;
		}
		return value;
	},
	toInt: async function(value){
		try{
			value = parseInt(value);
		}catch(err){}
		return value;
	},
	toFloat: async function(value){
		try{
			value = parseFloat(value);
		}catch(err){}
		return value;
	},
	toBoolean: async function(value){
		try{
			if(value === "true"){
				value = true;
			}else if(value === "false"){
				value = false;
			}
		}catch(err){}
		return value;
	},
	toJson: async function(value) {
		if(_.isString(value)){
			try{
				return JSON.parse(value);
			}catch(jsonerr){
				if(_.isNumber(value)){
					_.toNumber(value);
				}
				return value;
			}
		}
		return value;
	}
};

let DefaultSanitizers = {
	isInt:["toInt"],
	isFloat:["toFloat"],
	isBoolean:["toBoolean"],
	isJson:["toJson"],
	null:["toNull"]
};


let Helper = {
	wildcardValue: function (wildcard, value){
		let index = wildcard.split(".").indexOf("*");
		if(index >= 0){
			let parts_v = value.split(".");
			let parts_w = wildcard.split(".");
			parts_w[index] = parts_v[index];
			return parts_w.join(".");
		}else{
			return wildcard;
		}
	},
	flattenObject: function(obj, all){
		let flattened = {};
		function recurse(current, property) {
			if (!property && Object.getOwnPropertyNames(current).length === 0) {
				return;
			}
			if (Object(current) !== current || Array.isArray(current)) {
				flattened[property] = current;
			} else {
				let isEmpty = true;
				for (let p in current) {
					isEmpty = false;
					if(property && all === true){
						flattened[property] = "defined";
					}
					recurse(current[p], property ? property + "." + p : p);
				}
				if (isEmpty) {
				  	flattened[property] = {};
				}
			}
		}

		if (obj) {
			recurse(obj);
		}
		return flattened;
	},
	objectPath: function (obj, path) {
		if (Object.prototype.hasOwnProperty.call(obj, path)) {
			return obj[path];
		}

		let keys = path.replace(/\[(\w+)\]/g, ".$1").replace(/^\./, "").split(".");
		let copy = {};
		for (let attr in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, attr)) {
				copy[attr] = obj[attr];
			}
		}

		for (let i = 0, l = keys.length; i < l; i++) {
			if (Object.hasOwnProperty.call(copy, keys[i])) {
				copy = copy[keys[i]];
			} else {
				return;
			}
		}
		return copy;
	},
	findObjKeys: function(key, data){
		let ret = [];
		let path = [];
		let ar = key.split(".");
		for (let i = 0; i < ar.length; i++){
			if(ar[i] === "*"){
				break;
			}
			path.push(ar[i]);
		}
		path = path.join(".");
		let data_part = Helper.objectPath(data, path);
		if(data_part){
			Object.keys(data_part).forEach(function(item){
				ret.push(key.replace("*", item));
			});
		}
		return ret;
	},
	addRule:async function (key, params, flattened, data){
		let ret = {};
		ret[key] = {
			checks:{},
			before:{},
			after:{},
			required:false
		};

		for (let vlKey in params){
			if(vlKey === "if") {
				let isElse = false;
				let isOneTrue = false;

				for(let item_i in params.if){
					let item = params.if[item_i];

					if(item.condition === "else"){
						isElse = item.rules;
					}else{
						let property_string, value, operand;
						if(_.isString(item.condition)){
							let ifParts = item.condition.split("::");
							property_string = ifParts[0];
							value = ifParts[1];
							operand = "===";
						}else{
							property_string = item.condition.property;
							value = item.condition.value;
							operand = item.condition.operand;
						}

						property_string = Helper.wildcardValue(property_string, key);
						let property = item.condition.unflattened ? Helper.getUnflattenedValue(property_string, data) : Helper.getValue(property_string, flattened);

						if(await Operands[operand](property, value)){
							isOneTrue = true;
							for (let rKey in item.rules) {
								Helper.addCheck(ret, key, item.rules, rKey);
							}

						}
					}
				}

				if(isElse !== false && isOneTrue === false){
					ret[key].checks = _.merge({}, ret[key].checks, isElse);
				}
			} else {
				Helper.addCheck(ret, key, params, vlKey);
			}
		}
		return ret;
	},
	addCheck: function(ret, retKey, rules, ruleKey){
		switch (ruleKey) {
			case "required":
			case "null":
			case "sanitizer":
				ret[retKey][ruleKey] = rules[ruleKey];
				break;
			default:
				ret[retKey].checks[ruleKey] = rules[ruleKey];
		}
		return ret;
	},
	getValue: function(path, flattenedData){
		try {
			return flattenedData[path];
		} catch (error) {
			return {};
		}
	},
	getUnflattenedValue: function(path, unflattenedData){
		try {
			let arr = path.split(".");
			let obj = unflattenedData;
			while (arr.length && (obj = obj[arr.shift()])){}
			return obj;
		} catch (error) {
			return {};
		}
	},
	addError: function(ret, key, value, validator, message){
		ret.hasErrors = true;
		if (!ret.errors[key]) {
			ret.errors[key] = {
				messages: [],
				value: value
			};
		}

		if (message === false) {
			message = "E_validation_error_" + validator;
		}

		ret.errors[key].messages.push({validator: validator, message: message});

		return ret;
	},
	createError: function (ret, rKey, rule, validatorName, message, checks) {
		let key = rKey;
		if (checks) {
			if (rule.checks[validatorName].globalError) {
				key = "globalErrors";
				if(rule.checks[validatorName].globalError.message) {
					message = rule.checks[validatorName].globalError.message;
				}
			}
		} else {
			if (rule[validatorName] && rule[validatorName].globalError) {
				key = "globalErrors";
				if(rule[validatorName].globalError.message) {
					message = rule[validatorName].globalError.message;
				}
			}
		}
		return Helper.addError(ret, key, rule.value, validatorName, message);
	}
}

let sanitize = async function(value, validator, param){
	let sanitizer = false;
	if(param.sanitizer){
		sanitizer = param.sanitizer;
	}else if(!param.sanitizer && param.sanitizer !== false){
		if(DefaultSanitizers[validator]){
			sanitizer = DefaultSanitizers[validator];
		}
	}

	if(sanitizer){
		for (let indexFn in sanitizer) {
			value = await Sanitizers[sanitizer[indexFn]](value);

		}
	}
	return value;
}

let make = async function(data, rules){
	let ret = {
		validations:{}
	};
	let flattened = Helper.flattenObject(data);

	for (let rKey in rules){
		let vl = rules[rKey];
		if(rKey.split(".").indexOf("*") >= 0){

			let objkeys = Helper.findObjKeys(rKey, data);
			for (let item_i in objkeys) {
				let item = objkeys[item_i];
				ret.validations = _.merge({}, ret.validations, (await Helper.addRule(item, vl, flattened, data)));
			}
		}else{
			ret.validations = _.merge({}, ret.validations, (await Helper.addRule(rKey, vl, flattened, data)));
		}
	}

	Object.keys(ret.validations).forEach(function(key){
		ret.validations[key].value = Helper.getValue(key, flattened);
	});

	return ret;
}

const public_functions = function() {
	return {
		validate: async function (data, rules) {
			let mk = await make(data, rules);

			let ret = {
				hasErrors:false,
				errors:{},
				values:{}
			};

			for (let rKey in mk.validations) {
				let rule = mk.validations[rKey];
				if(rule.required){
					let allflat = Helper.flattenObject(data, true);

					let result = false;
					for(let key in allflat){
						if (key === rKey) {
							result = true;
						}
					}

					if(result === false){
						let message = false;
						if(rule.required.message){
							message = rule.required.message;
						}

						ret = Helper.createError(ret, rKey, rule, "required", message, false);
					}

				}

				if(!_.isUndefined(rule.value)){
					if(rule.value === null){
						let message = false;
						if(rule.null && rule.null.message){
							message = rule.required.message;
						}
						if(!rule.null){
							let globalError = false;
							if (rule.globalError && rule.globalError.message) {
								globalError = rule.globalError.message;
							}

							ret = Helper.createError(ret, rKey, rule, "not_null", message, false);
						}else{
							ret.values[rKey] = rule.value;
						}
					}else{
						let itemError = false;
						for (let cKey in rule.checks) {

							let param = {};
							if(rule.checks[cKey] !== true){
								param = rule.checks[cKey];
							}

							//sanitacia
							if(rule.sanitizer) {
								rule.value = await Sanitizers[rule.sanitizer](rule.value);
							}else{
								rule.value = await sanitize(rule.value, cKey, param);
							}

							//validacia parametra
							let check = await Validators[cKey](rule.value, param);

							if(check === false){
								let message = false;
								if(param.message){
									message = param.message;
								}
								ret = Helper.createError(ret, rKey, rule, cKey, message, true);
							}
						}
						if(itemError === false){
							ret.values[rKey] = rule.value;
						}
					}

				}

			}
			dot.object(ret.values);
			return ret;

		},
		registerValidator: function (name, fn){
			Validators[name] = fn;
		},
		registerSanitizer: function (name, fn){
			Sanitizers[name] = fn;
		},
		setDefautlSanitizer: function(validator_name, sanitizers) {
			DefaultSanitizers[validator_name] = sanitizers;
		},
		registerOperand: function (name, fn){
			Operands[name] = fn;
		}
	}
}

module.exports = public_functions;
