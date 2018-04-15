var notes=undefined;
exports.configure=function(params){
    notes=params;
}

var readNote=function(key,user, res, done){
    notes.read(key,
        function(err, data){
            if(err){
                res.render('showerror',{
                    title:"Could not read note"+key,
                    error:err,
                    user: user?user:undefined
                });
            done(err);
            }else 
                done(null, data);
        });
}

exports.view=function(req, res, nex){
    if (req.query.key){
        readNote(req.query.key,req.user, res, function(err, data){
            if (!err){
                res.render('noteview', {
                    title:data.title,
                    notekey:req.query.key,
                    note:data,
                    user:req.user?req.user:undefined
                });
            }
        });
    }else{
        res.render('showerror',{
            title:"No key given for note",
            error:"Mus provide a Key to view a Note",
            user:req.user?req.user:undefined
        });
    }
}

exports.save=function(req, res, next){
    ((req.body.docreate==="create")?notes.create:notes.update)
    (req.body.notekey, req.body.title, req.body.body,
        function(err){
            if (err){
                res.render('showerror',{
                    title:"Could not update file",
                    error:err,
                    user:req.user?req.user:undefined
                });
            }else{
                res.redirect('/noteview?key='+req.body.notekey);
            }
        });
}

exports.add=function(req, res, next){
    res.render('noteedit',{
        title:"Add a note",
        docreate: true,
        notekey:"",
        note:undefined,
        user: req.user ? req.user : undefined
    });
}

exports.edit=function(req, res, next){
    if (req.query.key){
        readNote(req.query.key,req.user, res, function(err, data){
            if (!err){
                res.render('noteedit',{
                    title:data?("Edit"+data.title):"Add a Note",
                    docreate:false,
                    notekey:req.query.key,
                    note:data,
                    user: req.user ? req.user : undefined
                });
            }
        });
    }else{
        res.render('showerror',{
            title:"No key given for note",
            error:"Must provide a Key to view a Note",
            user: req.user ? req.user : undefined
        });
    }
}

exports.destroy=function(req, res, next){
    if (req.query.key){
        readNote(req.query.key,req.user, res, function(err, data){
            if (!err){
                res.render('notedestroy', {
                    title:data.title,
                    notekey:req.query.key,
                    note:data,
                    user: req.user ? req.user : undefined
                });
            }
        });
    }else{
        res.render('showerror',{
            title:"No key given for Note",
            error:"Must provide a Key to view a Note",
            user: req.user ? req.user : undefined
        });
    }
}

exports.dodestroy=function(req, res, next){
    notes.destroy(req.body.notekey, function(err){
        if (err){
            res.render('showerror',{
                title:"Could not delete Note "+req.query.key,
                error:err
            });
        }else{
            res.redirect('/');
        }
    });
}