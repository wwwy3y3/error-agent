var Codes= {};

Codes.PW_WRONG= function (req, res) {
	res.render("relogin", { title:"relogin", msg: "pw wrong" });
}

Codes.TESTERR= function (req, res) {
	res.render("error/test", { title:"testerr", msg: "test err" });
}

module.exports= Codes;