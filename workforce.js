var workforce = require('workforce');
var manager = workforce('./app.js');
manager.set('workers', 4);
manager.set('title', 'Notes');
manager.set('restart threshold', '10s');
manager.set('exit timeout', '5s');
manager.listen(process.env.PORT || 3000);