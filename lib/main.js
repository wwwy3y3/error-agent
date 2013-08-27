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

ErrorAgent.use = function(error) {
	var defaultFn= function (req, res) {
			res.status(error.status || 500);

			if(req.xhr)
				return res.json(error.status, { msg: error.msg });

			if(req.accepts('html'))
				return ErrorAgent.render(req.url, res, error);

			return res.type('txt').send(error.msg);
		};

	if(error.code)
		return { send: ErrorAgent.actions[error.code] };

	return { send: defaultFn };
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

    ErrorAgent.use(error).send(req, res);
}

ErrorAgent.errorHandler = function(err, req, res, next){
    //error object= Error with status
    ErrorAgent.use(err).send(req, res);
};

module.exports= ErrorAgent;