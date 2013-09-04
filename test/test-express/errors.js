var Codes= {};

Codes.PW_WRONG= function (err, req, res) {
	res.render("relogin", { title:"relogin", msg: "pw wrong" });
}

Codes.TESTERR= function (err, req, res) {
	res.render("error/test", { title:"testerr", msg: "test err" });
}

//status
// 400 - bad request
// 409 - conflict

//forbidden
Codes['403']= function (err, req, res) {
	res.status(403)
		.format({
		  html: function(){
		    res.render('error/403');
		  },
		  
		  json: function(){
		    res.json({ msg: err.msg });
		  }
		});	
}



//not found
Codes['404']= function (err, req, res) {
	res.status(404)
		.format({
		  html: function(){
		    res.render('error/404');
		  },
		  
		  json: function(){
		    res.json({ msg: err.msg });
		  }
		});	
}

//internal error
Codes['500']= function (err, req, res) {
	res.status(500)
		.format({
		  html: function(){
		    res.render('error/500');
		  },
		  
		  json: function(){
		    res.json({ msg: err.msg });
		  }
		});	
}

module.exports= Codes;