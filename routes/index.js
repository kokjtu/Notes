var express = require('express');
var router = express.Router();
var notes=undefined;
var user=undefined;
exports.configure=function(params){
	notes=params;
}
exports.index=router.get('/',function(req,res,next){
	notes.titles(function(err, noteList){
		if (err)
			res.render('showerror', {title:'Notes', error:'Could not read data'});
		else
			res.render('index',{title:'Notes', notes:noteList, user:req.user});
	});
});
