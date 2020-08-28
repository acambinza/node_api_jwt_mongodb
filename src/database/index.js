const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/noderest',{ useMongoClient: true });
//mongoose.set('useCreateIndex', true);
//mongoose.set('useNewUrlParser', true);

mongoose.Promise = global.Promise;
//console.log(mongoose);
module.exports = mongoose;
