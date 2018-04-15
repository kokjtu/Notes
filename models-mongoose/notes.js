var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var dburl=undefined;
exports.connect=function(thedburl, callback){
	dburl=thedburl;
	mongoose.connect(dburl);
}

exports.disconnect=function(callback){
	mongoose.disconnect(callback);
}

var NoteSchema=new Schema({
	notekey:String,
	title:String,
	body:String
});

mongoose.model('Note', NoteSchema);
var Note=mongoose.model('Note');

exports.create=function(key, title, body, callback){
	var newNote=new Note();
	newNote.notekey=key;
	newNote.title=title;
	newNote.body=body;
	newNote.save(function(err){
		if (err)
			callback(err);
		else 
			callback();
	});
}

exports.update=function(key, title, body, callback){
	exports.read(key, function(err, doc){
		if (err)
			callback(err);
		else {
			doc.notekey=key;
			doc.title=title;
			doc.body=body;
			doc.save(function(err){
				if (err)
					callback(err);
				else
					callback();
			});
		}
	});
}

exports.read=function(key, callback){
	Note.findOne({notekey:key}, function(err, doc){
		if (err)
			callback(err);
		else 
			callback(null, doc);
	});
}

exports.destroy=function(key, callback){
	exports.read(key, function(err, doc){
		if (err)
			callback(err);
		else {
			doc.remove();
			callback();
		}
	});
}

exports.title=function(callback){
	Note.find().exec(function(err,docs){
		if (err)
			callback(err);
		else {
			if (docs){
				var noteList=[];
				docs.forEach(function(note){
					noteList.push({
						key:note.notekey,
						title:note.title
					});
				});
				callback(null, noteList);
			} else {
				callback()
			}
		}
	});
}