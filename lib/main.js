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
	var hash= req.route.method.toUpperCase() + req.route.path; // ex: POST/login

	//if code defined, hash is defined for special action
	if(err.code && ErrorAgent.actions[hash] && ErrorAgent.actions[hash][err.code]){
		return ErrorAgent.actions[hash][err.code](err, req, res);
	}else if(err.code && ErrorAgent.actions.defaults[err.code]){ //code defined, but not in url, so goto defaults
		return ErrorAgent.actions.defaults[err.code](err, req, res);
	}else if(!err.code && err.status){ //status
		return ErrorAgent.actions.defaults[err.status](err, req, res);
	}else{ //no code, or code not defined in defaults, then exec defaults in defaults url
		return ErrorAgent.actions.defaults.defaults(err, req, res);
	}

};

ErrorAgent.render = function(url, res, error) {
	var views= {
		notFound: '404',
		notAuth: '403', 
		internal: '500'
	};

	//override the files struc
	if(ErrorAgent.configures.folder)
		for(key in views)
			views[key]= ErrorAgent.configures.folder + views[key];

	if(error.status===404)
		return res.render(views.notFound, { title: '404 - not found', url: url, msg: error.msg });

	if(error.status===403)
		return res.render(views.notAuth, { title: '403 - not authorize', url: url, msg: error.msg });

	return res.render(views.internal, { title: '500 - internal error', url: url, msg: error.msg });
};

ErrorAgent.pageNotFound= function(req, res, next){
    var error= new Error("page not found");
        error.status= 404;

    ErrorAgent.send(err, req, res)
}

ErrorAgent.errorHandler = function(err, req, res, next){
    //error object= Error with status
    ErrorAgent.send(err, req, res);
};

module.exports= ErrorAgent;