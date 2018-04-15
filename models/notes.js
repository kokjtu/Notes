var notes=[];
exports.notes=notes;
exports.update=exports.create=function(key,title,body,callback){
	notes[key]={
		title:title,
		body:body
	};
	callback(null);
};
exports.read=function(key, callback){
	if (!(key in notes))
		callback("No such key existed", null);
	else 
		callback(null, notes[key]);
};
exports.destroy=function(key, callback){
	if (!(key in notes))
		callback("Wrong key");
	else{
		delete notes[key];
		callback(null);
	}
};
exports.keys=function(){
	return Object.keys(notes);
};