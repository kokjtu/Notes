var events = require('events');
var emitter = module.exports.emitter = new events.EventEmitter();

var Sequelize = require('sequelize');
var Note = undefined;
module.exports.connect = function(params, callback) {
    var sequlz = new Sequelize(
        params.dbname, 
        params.username, 
        params.password,
        params.params
    );
    Note = sequlz.define('Note', {
        notekey: {
            type: Sequelize.STRING,
            primaryKey: true,
            unique: true
        },
        title: Sequelize.STRING,
        body: Sequelize.TEXT
    });
    Note.sync().then(function() {
        callback();
    }).error(function(err) {
        callback(err);
    });
}
exports.disconnect = function(callback) {
    callback();
}
 
exports.create = function(key, title, body, callback) {
    Note.create({
            notekey: key,
            title: title,
            body: body
        }).then(function(note) {
            exports.emitter.emit('noteupdated', {
                key: key,
                title: title,
                body: body
            });
            callback();
        }).error(function(err) {
            callback(err);
    });
}
 
exports.update = function(key, title, body, callback) {
    Note.find({ where:{ notekey: key} }).then(function(note) {
        if(!note) {
            callback(new Error("No note found for key " + key));
        } else {
            note.updateAttributes({
                title: title,
                body: body
            }).then(function() { 
                exports.emitter.emit('noteupdated', {
                    key: key,
                    title: title,
                    body: body
                });
                callback();
            }).error(function(err) {
                callback(err);
            });
        }
    }).error(function(err) {
        callback(err);
    });
}
 
exports.read = function(key, callback) {
    Note.find({ where:{ notekey: key} }).then(function(note) {
        if(!note) {
            callback("Nothing found for " + key);
        } else {
            callback(null, {
                notekey: note.notekey,
                title: note.title,
                body: note.body
            });
        }
    });
}
 
exports.destroy = function(key, callback) {
    Note.find({ where:{ notekey: key} }).then(function(note) {
        note.destroy().then(function() {
            emitter.emit('notedeleted', key);
            callback();
        }).error(function(err) {
            callback(err);
        });
    });
}
 
exports.titles = function(callback) { 
    Note.findAll().then(function(notes) { 
        var noteList = []; 
        notes.forEach(function(note) { 
            noteList.push({
                key: note.notekey,
                title: note.title
            }); 
        });
        callback(null, noteList);
    });
}