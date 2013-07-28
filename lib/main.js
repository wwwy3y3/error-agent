var util= require("util");
var ErrorAgent= {};
ErrorAgent.actions= {};

ErrorAgent.register= function (code, fn) {
	this.actions[code]= fn;
}

//{ status: 404, msg: "not found resource" }
//{ status: 403, msg: "not authorize to see" }
//{ status: 200, msg: "pw wrong, try again", code: "" }
ErrorAgent.handle = function(err) {
	if(!util.isError(err) && err.msg){
		var error= new Error(err.msg);
			error.status= err.status || 500;
			error.code= err.code || null;

		return error;
	}

	return err;
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
	if(error.status===404)
		return res.render('error/404', { title: '404 - not found', url: url, msg: error.msg });

	if(error.status===403)
		return res.render('error/403', { title: '403 - not authorize', url: url, msg: error.msg });

	return res.render('error/500', { title: '500 - internal error', url: url, msg: error.msg });
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