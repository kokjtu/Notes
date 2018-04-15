var LocalStrategy = require('passport-local').Strategy;
var users = undefined;
var passport = undefined;
 
exports.configure = function(params) {
    users = params.users;
    passport = params.passport;
}
 
module.exports.serialize = function(user, done) {
    done(null, user.id);
}
 
module.exports.deserialize = function(id, done) {
    users.findById(id, function(err, user) {
        done(err, user);
    });
}
 
module.exports.strategy = new LocalStrategy(
    function(username, password, done) {
        process.nextTick(function() {
            users.findByUsername(username, function(err, user) {
                if(!user) {
                    return done(null, false, {
                        message: 'Unknown user ' + username
                    });
                }
                if(user.password !== password) {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
                return done(null, user);
            });
        });
    }
);
 
module.exports.ensureAuthenticated = function(req, res, next) {
    if(req.isAuthenticated())
        return next();
    return res.redirect('/login');
}
 
module.exports.doAccount = function(req, res) {
    res.render('account', {
        title: 'Account information for ' + req.user.username,
        user: req.user
     });
}
 
module.exports.doLogin = function(req, res) {
    res.render('login', {
        title: 'Login to Note',
        user: req.user,
        message: req.flash('error')
    });
}
 
module.exports.postLogin = function(req, res) {
     res.redirect('/');
}
 
module.exports.doLogout = function(req, res) {
     req.logout();
     res.redirect('/');
}

module.exports.sendMessage = function(req, res) {
    users.allUsers(function(err, userList) {
       res.render('sendmessage', {
           title: "Send a message",
           user: req.user,
           users: userList,
           message: req.flash('error')
       });
    });
}
 
module.exports.doSendMessage = function(req, res) {
    users.sendMessage(req.body.seluserid, 
        req.user.id, req.body.message, function(err) {
            if(err) {
                res.render('showerror', {
                    user: req.user ? req.user : undefined,
                    title: "Could not send message",
                    error: err
                });
            } else {
                res.redirect('/');
            }
    });
}