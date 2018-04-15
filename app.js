var http = require('http');

var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressSession=require('express-session');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var routes = require('./routes/index');
var users = require('./routes/users');
var notes=require('./routes/notes');
//var models=require('./models-fs/notes');
/*var models=require('./models-mongoose/notes');
models.connect("mongodb://localhost/notes", function(err){
	if (err)
		throw err;
});*/
var models = require('./models-sequelize/notes');
var usersModels = require('./models-sequelize/users');

models.connect(require('./sequelize-params'),
	function(err){
		if (err)
			throw err;
	});
usersModels.connect(require('./sequelize-params'),
	function(err){
		if (err)
			throw err;
	});
users.configure({
	users:usersModels,
	passport:passport
});
/*models.connect({
	dbname:"notes",
	username:"root",
	password:"102938",
	params:{
		host:"127.0.0.1",
		dialect:"mysql"
	}
},
function(err){
	if (err)
		throw err;
});*/
notes.configure(models);
routes.configure(models);
var app = express();

passport.serializeUser(users.serialize);
passport.deserializeUser(users.deserialize);
passport.use(users.strategy);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({secret: 'keyboard cat'}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes.index);
app.use('/noteview', notes.view);
app.use('/noteadd', users.ensureAuthenticated, notes.add);
app.use('/noteedit', users.ensureAuthenticated, notes.edit);
app.use('/notedestroy', users.ensureAuthenticated, notes.destroy);
app.post('/notedodestroy', users.ensureAuthenticated, notes.dodestroy);
app.post('/notesave', users.ensureAuthenticated, notes.save);
app.use('/account', users.ensureAuthenticated, users.doAccount);
app.use('/login', users.doLogin);
app.post('/doLogin', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}), users.postLogin);
app.use('/logout', users.doLogout);
app.use('/sendmessage', users.ensureAuthenticated, users.sendMessage);
app.post('/dosendmessage', users.ensureAuthenticated, users.doSendMessage);

/*app.use('/users', users);
app.use('/noteadd', notes.add);
app.post('/notesave', notes.save);
app.use('/noteview', notes.view);
app.use('/noteedit', notes.edit);
app.use('/notedestroy', notes.destroy);
app.post('/notedodestroy', notes.dodestroy);*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var server = http.Server(app);
var io = require('socket.io').listen(server);
app.set('port', 3000);
 
server.listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
 
io.sockets.on('connection', function(socket) {
    socket.on('notetitles', function(fn) {        
        models.titles(function(err, titles) {
            if(err) {
                util.log(err); 
            } else {
                fn(titles);
            }
        });
     });
  
    var broadcastUpdated = function(newnote) {
        socket.emit('noteupdated', newnote);
    }
    models.emitter.on('noteupdated', broadcastUpdated);
    socket.on('disconnect', function() {
       models.emitter.removeListener('noteupdated', broadcastUpdated);
    });
 
    var broadcastDeleted = function(notekey) {
       socket.emit('notedeleted', notekey);
    }
    models.emitter.on('notedeleted', broadcastDeleted);
    socket.on('disconnect', function() {
        models.emitter.removeListener('notedeleted', broadcastDeleted);
    });

    socket.on('getmessages', function(id, fn) {
        usersModels.getMessages(id, function(err, messages) {
            if(err) {
                util.log('getmessages ERROR ' + err);
            } else
                fn(messages);
        });
    });
  
    var broadcastNewMessage = function(id) {
        socket.emit('newmessage', id);
    }
    usersModels.emitter.on('newmessage', broadcastNewMessage);
  
    var broadcastDelMessage = function() {
        socket.emit('delmessage');
    }
    usersModels.emitter.on('delmessage', broadcastDelMessage);
  
    socket.on('disconnect', function() {
        usersModels.emitter.removeListener('newmessage', broadcastNewMessage);
        usersModels.emitter.removeListener('delmessage', broadcastDelMessage);
    });
  
    socket.on('dodelmessage', function(id, from, message, fn) {
        // do nothing
    });
 
});