const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
// pra dar conta dos parametros passados no URL
app.use(bodyParser.urlencoded({ extended : false}));

require('./app/controllers/index')(app);

app.listen(3000, function(){
        console.log('start PORT 3000')
});