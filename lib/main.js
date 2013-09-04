var util= require("util");
var ErrorAgent= {};
ErrorAgent.actions= {};
ErrorAgent.configures= {};

ErrorAgent.register= function (code, fn) {
	this.actions[code]= fn;
}

ErrorAgent.config= function (params) {
	if(params.codesPath)
		ErrorAgent.actions= require(params.codesPath);

	ErrorAgent.configures= params;
}

//{ status: 404, msg: "not found resource" }
//{ status: 403, msg: "not authorize to see" }

//{ code: "ACC_NOTEXIST", msg: "" }

//{ err: Error object, code: "PW_WRONG" }
ErrorAgent.handle = function(param) {
	if(!util.isError(param)){
		var msg= param.msg || "error";
		var error= new Error(msg);

		for(key in param)
			if(key !== "msg")
				error[key]= param[key];

		return error;
	}else if(param.err && util.isError(param.err)){  //{ err: Error object, code: "PW_WRONG" }
		var error= param.err;

		if(param.code)
			error.code= param.code;
		return error;
	}
};

ErrorAgent.send = function(err, req, res) {
	//override the files struc
	if(ErrorAgent.configures.folder)
		var defaultFile= ErrorAgent.configures.folder + 'default';
	else
		var defaultFile= 'default';

	var defaultFn= function (err, req, res) {
		res.statusCode= err.status || 500;
		res.format({
		  html: function(){
		    res.render(defaultFile);
		  },
		  
		  json: function(){
		    res.json({ msg: err.msg });
		  }
		});
	}

	if(!err.status)
		err.status= 500; //default status

	if(err.code)
		return ErrorAgent.actions[err.code](err, req, res);
	else if(ErrorAgent.actions[err.status])
		return ErrorAgent.actions[err.status](err, req, res);
	else
		return defaultFn(err, req, res); //fallback
};


ErrorAgent.pageNotFound= function(req, res, next){
    var error= new Error("page not found");
        error.status= 404;

    ErrorAgent.send(error, req, res);
}

ErrorAgent.errorHandler = function(err, req, res, next){
    //error object= Error with status
    ErrorAgent.send(err, req, res);
};

module.exports= ErrorAgent;