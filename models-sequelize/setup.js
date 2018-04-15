var users = require('./users');
users.connect(require('../sequelize-params'),
    function(err) {
        if(err)
            throw err;
        else {
             users.create('5', 
                         'user5', 
                         '123', 
                         'user5@kokjtu.com',
                         function(err) {
                             if(err)
                                 throw err; 
                         });
             users.create('6', 
                         'user6', 
                         '123', 
                         'user6@kokjtu.com',
                         function(err) {
                             if(err)
                                 throw err; 
                         });
        }
    });