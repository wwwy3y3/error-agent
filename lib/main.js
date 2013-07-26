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
			if(req.xhr)
				return res.json(error.httpCode, { msg: error.msg });

			if(req.accepts('html'))
				self.render(req.url, res, error);
		}
	}
};

ErrorAgent.render = function(url, res, error) {
	res.status(error.httpCode || 500);

	if(error.httpCode===404)
		return res.render('error/404', { title: '404 - not found', url: url, msg: error.msg });

	if(error.httpCode===403)
		return res.render('error/403', { title: '403 - not authorize', url: url, msg: error.msg });

	return res.render('error/500', { title: '500 - internal error', url: url, msg: error.msg });
};

module.exports= ErrorAgent;