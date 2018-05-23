// TODO delete me and write it to examples
const fs = require("fs");
const _ = require("lodash");
const settings = require("../settings/settings.js")();
const error = require("../error/error.js");
const debug = require("debug")("app.validator");
const validator = require("./asyncValidator.js")();


//custom validators
fs.readdirSync(__dirname+"/validators/").forEach(file => {
	if(!fs.lstatSync(__dirname+"/validators/"+file).isDirectory()){
		let parts = file.split(".");
		validator.registerValidator( parts[0], require(__dirname+"/validators/"+file) );
	}
});

//custom sanitizers
fs.readdirSync(__dirname+"/sanitizers/").forEach(file => {
	if(!fs.lstatSync(__dirname+"/sanitizers/"+file).isDirectory()){
		let parts = file.split(".");
		validator.registerSanitizer( parts[0], require(__dirname+"/sanitizers/"+file) );
	}
});

let Rules = {};

//get validators
fs.readdirSync(__dirname+"/../").forEach(dir => {
	let path_string = __dirname+"/../"+dir;
	if(fs.lstatSync(path_string).isDirectory() && settings.getDirExcluded().indexOf(dir) < 0){
		fs.readdirSync(path_string).forEach(file => {
			try{
				let parts = file.split(".");
				if(parts[0] === "validator" && parts[1] === "js"){
					Rules[dir] = require(path_string+"/validator.js");
				}
			}catch(err){
				console.log(err);
			}
		});
	}
});



let public_functions = {
	validate: async function (route, params) {
		let ret = {};
		if(route.validator){
			let rule = {};

			for (let i in route.validator){
				let vp = route.validator[i].split(":");
				let index = 0;
				if(vp.length === 2){
					params.validatorValus = vp[1];
				}

				let validatorPath = vp[index];
				let validatorParts = validatorPath.split(".");

				try{
					if(validatorParts.length === 2){
						rule = _.merge({}, rule, await Rules[validatorParts[0]][validatorParts[1]](route, params));
					}else{
						rule = _.merge({}, rule, await Rules[validatorParts[0]](route, params));
					}
				}catch(err){
					throw new Error("Missing rule " + validatorPath);
				}
			}

			let data = _.merge({}, params.req.params, params.req.body, params.req.query);

			let validation = await validator.validate(data, rule);
			if(validation.hasErrors === true){
				throw new error.validate(validation.errors);
			}
			ret = validation.values;
		}
		return ret;
	}
}

module.exports = public_functions;
