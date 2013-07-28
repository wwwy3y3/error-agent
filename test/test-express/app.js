
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , ErrorAgent= require(path.join('..', '..'));

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  //error
  app.use(ErrorAgent.pageNotFound);
  app.use(ErrorAgent.errorHandler);

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

ErrorAgent.register("PW_WRONG", function (req, res) {
  res.render("relogin", { title:"relogin", msg: "pw wrong" });
})

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/404', function(req, res, next){
  // trigger a 404 since no other middleware
  // will match /404 after this one, and we're not
  // responding here
  next();
});

app.get('/also404', function(req, res, next){
  // trigger a 403 error
  next(ErrorAgent.handle({status: 404, msg: "not found"}));
});

app.get('/relogin', function(req, res, next){
  // trigger a 403 error
  next(ErrorAgent.handle({status: 200, msg: "not found", code: "PW_WRONG"}));
});

app.get('/403', function(req, res, next){
  // trigger a 403 error
  next(ErrorAgent.handle({status: 403, msg: "not auth"}));
});

app.get('/500', function(req, res, next){
  // trigger a generic (500) error
  next(new Error('keyboard cat!'));
});

app.get('/also500', function(req, res, next){
  // trigger a generic (500) error
  next(ErrorAgent.handle({status: 500, msg: "internal ??? haha"}));
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
