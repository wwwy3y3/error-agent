var util= require("util");
var ErrorAgent= {};
ErrorAgent.handle = function(err) {
	if(!util.isError(err) && err.msg){
		var error= new Error(err.msg);
			error.httpCode= err.httpCode || 500;

		return error;
	}

	return err;
};

ErrorAgent.use = function(error) {
	var self= this;

	return {
		send: function (req, res) {
			res.status(error.httpCode || 500);

			if(req.xhr)
				return res.json(error.httpCode, { msg: error.msg });

			if(req.accepts('html'))
				return self.render(req.url, res, error);

			return res.type('txt').send(error.msg);
		}
	}
};

ErrorAgent.render = function(url, res, error) {
	if(error.httpCode===404)
		return res.render('error/404', { title: '404 - not found', url: url, msg: error.msg });

	if(error.httpCode===403)
		return res.render('error/403', { title: '403 - not authorize', url: url, msg: error.msg });

	return res.render('error/500', { title: '500 - internal error', url: url, msg: error.msg });
};

ErrorAgent.pageNotFound= function(req, res, next){
    var error= new Error("page not found");
        error.httpCode= 404;

    ErrorAgent.use(error).send(req, res);
}

ErrorAgent.errorHandler = function(err, req, res, next){
    //error object= Error with httpCode
    ErrorAgent.use(err).send(req, res);
};

module.exports= ErrorAgent;