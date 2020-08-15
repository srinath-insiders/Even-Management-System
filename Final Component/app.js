//importing the modules
var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use('/styles', express.static('styles'));
app.use('/myConnections/styles', express.static('styles'));
app.use('/images', express.static('images'));
app.use('/views', express.static('views'));
app.use('/utils', express.static('utils'));
app.use('/myConnections/images', express.static('images'));
var session = require('express-session');
app.use(session({ secret: 'srisession' }));

// XSS filter
const helmet = require('helmet')

// Sets "X-XSS-Protection: 1; mode=block".
app.use(helmet.xssFilter())


var connectionRouter = require('./controllers/connectionController');
var profileRouter = require('./controllers/profileController');
app.use('/', connectionRouter.ConnectionRouter);
app.use('/myConnections', profileRouter.ProfileRouter);
app.get('/*', function (req, res) {
    res.redirect('/');
});

//listening on port 8080
app.listen(8080);
console.log('Listening to the port 8080');

