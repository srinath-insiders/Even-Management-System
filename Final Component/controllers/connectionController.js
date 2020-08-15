//importing the modules
var express = require('express');
var router = express.Router(); //express router package
var utility = require('./../utils/validateConnectionId');
var connectionDBUtil = require('./../utils/ConnectionDB');
var userConnectionDBUtil = require('./../utils/UserConnectionDB');
var bodyParser = require('body-parser');

const { check, validationResult } = require('express-validator'); // express validator
var connectionObj = require('./../models/connection');
const shortid = require('shortid');
var formatted_address ;
var  destination_address;
const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBbArMQwGd3ogXJUd90fFR3zLZVBDLeMTU',
    Promise: Promise
});

// XSS filter
const helmet = require('helmet')

// Sets "X-XSS-Protection: 1; mode=block".
router.use(helmet.xssFilter())


const { sanitizeBody } = require('express-validator');


var urlencodedParser = bodyParser.urlencoded({ extended: false });


//IMPLEMENTING ROUTES
// routing to index page
router.get('/', function (req, res) {
    res.render('index', { session: req.session.theUser });
});


// route to connections page
router.get('/connections', async function (req, res) {
    res.render('connections', { connections: await connectionDBUtil.connections(), connectionList: await connectionDBUtil.connectionsType(), session: req.session.theUser });
});

// route to newConnection page
router.get('/newConnection', function (req, res) {
    if(req.session.theUser){
        res.render('newConnection', { session: req.session.theUser, error: null });
    }else{
    res.redirect('/');
    }
    
});
// route to index page
router.get('/index', function (req, res) {
    res.render('index', { session: req.session.theUser });
});
// route to about page
router.get('/about', function (req, res) {
    res.render('about', { session: req.session.theUser });
});
//route to Contact page
router.get('/contact', function (req, res) {
    res.render('contact', { session: req.session.theUser });
});
//adding new connection
router.post('/addNewConnection', urlencodedParser,
    //validating workshopname
    check('workshopname').custom(value => {
        if (value) {
            if (value.length >= 5 && value.length <= 50) {
                return /^[a-zA-Z ]*$/.test(value)
            } else {
                return Promise.reject('*Note - Workshop name (Min Length - 5, Max Length - 50)');
            }
        }else{
            return Promise.reject('Workshop name should not be empty'); ;
        }
    }).withMessage('Workshop name should be alphabets and can contain spaces'),
    //validating workshoptype
    check('workshoptype').custom(value => {
        if(value === ''){
            return Promise.reject('Please select a valid workshop type'); 
        }else{
            return true
        }
    }),
    //validating details
    check('details').custom(value => {
        if (value) {
            value = value.replace(/\s/g, '');
            if (value.length >= 10 && value.length <= 500) {
                return /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._,]*$/.test(value.trim())
            } else {
                return Promise.reject('*Note - Details (Min Length - 10, Max Length - 500)');
            }
        }else{
            return Promise.reject('Details should not be empty'); ;
        }
    }).withMessage('Details can be Alphanumeric and can contain spaces. And try to avoid special characters'),
    //validating location field
    check('location').custom(async value => {
        var error;
        if(value){
            await googleMapsClient.geocode({ address: value })
            .asPromise()
            .then((response) => {
                if (response.json.results.length == 0) {
                    error = 'Please enter a valid  address within United States'
                } else {
                    formatted_address = response.json.results[0].formatted_address;
                }
            })
            .catch((err) => {
                console.log(err);
            });
        }else{
            error = 'Location should not be empty'
        }
        if (error) {
            return Promise.reject(error)
        }
    }),
    //validating date field
    check('date').isAfter(new Date().toDateString()).withMessage("Event Date should be future date"),
    sanitizeBody('notifyOnReply').toBoolean(),
    async function (req, res) {
        var errors = await validationResult(req);
        if (!errors.isEmpty()) {
            res.render('newConnection', { session: req.session.theUser, error: errors.array() });
        } else {
            WorkshopObj = new connectionObj.Workshop(shortid.generate(), req.body.workshopname, req.body.workshoptype, formatted_address, req.body.details, req.body.date, 'commondance.jpeg', req.session.theUser.EmailAddress);
            await connectionDBUtil.addNewConnection(WorkshopObj);
            res.redirect('connections');
        }
    });
router.post('/updateNewConnection', urlencodedParser,
    check('workshopname').custom(value => {
        if (value) {
            if (value.length >= 5 && value.length <= 50) {
                return /^[a-zA-Z ]*$/.test(value)
            } else {
                return Promise.reject('*Note - Workshop name (Min Length - 5, Max Length - 50)');
            }
        }else{
            return Promise.reject('Workshop name should not be empty'); ;
        }
    }).withMessage('Workshop name should be alphabets and can contain spaces'),
    //validating workshop type
    check('workshoptype').custom(value => {
        if(value === ''){
            return Promise.reject('Please select a valid workshop type'); 
        }else{
            return true
        }
    }),
    //validating details
    check('details').custom(value => {
        if (value) {
            value = value.replace(/\s/g, '');
            if (value.length >= 10 && value.length <= 500) {
                return /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._,]*$/.test(value)
            } else {
                return Promise.reject('*Note - Details (Min Length - 10, Max Length - 500)');
            }
        }else{
            return Promise.reject('Details should not be empty'); ;
        }
    }).withMessage('Details can be Alphanumeric and can contain spaces. And try to avoid special characters'),
       //validating location
    check('location').custom(async value => {
        var error;
        if(value){
            await googleMapsClient.geocode({ address: value })
            .asPromise().then((response) => {
                if (response.json.results.length == 0) {
                    error = 'Please enter a valid  address within United States'
                } else {
                    formatted_address = response.json.results[0].formatted_address;
                }
            })
            .catch((err) => {
                console.log(err);
            });
        }else{
            error = 'Location should not be empty'
        }
        if (error) {
            return Promise.reject(error)
        }
    }),
    //validating date field
    check('date').isAfter(new Date().toDateString()).withMessage("Event Date should be future date"),
    sanitizeBody('notifyOnReply').toBoolean(),
    async function (req, res) {
        var errors = await validationResult(req);
        if (!errors.isEmpty()) {
            WorkshopObj = new connectionObj.Workshop(req.body.workshopid, req.body.workshopname, req.body.workshoptype, formatted_address, req.body.details, req.body.date, 'commondance.jpeg', req.session.theUser.EmailAddress);
            res.render('updateNewConnection', { session: req.session.theUser,data:WorkshopObj, error: errors.array() });
        } else {
            WorkshopObj = new connectionObj.Workshop(req.body.workshopid, req.body.workshopname, req.body.workshoptype, formatted_address, req.body.details, req.body.date, 'commondance.jpeg', req.session.theUser.EmailAddress);
            await connectionDBUtil.updateNewConnection(WorkshopObj);
            await userConnectionDBUtil.updateRespectiveConnectionDetails(WorkshopObj);
            res.redirect('connections');
        }
    });

//connection router
router.get('/connection', async function (req, res) {
    var connectionID;
    if (Object.keys(req.query).length === 1 && Object.keys(req.query)[0] === 'connectionID') {
        routingCheck(req, res);
    } else {
        // render the list of connections page
        res.render('connections', { connections: await connectionDBUtil.connections(), connectionList: await connectionDBUtil.connectionsType(), session: req.session.theUser });
    }
});

//login router
router.get('/login', async function (req, res) {
    res.render('login', { session: req.session.theUser, error: null ,page:'userlogin'});
});

//findyourroute router
router.get('/findyourroute', async function (req, res) {
    if (req.session.theUser) {
        var connectionDetail;
        if (Object.keys(req.query)[0] === 'connectionID') {
            connectionID = req.query.connectionID;
            connectionDetail = await connectionDBUtil.connection(connectionID);
            if (connectionDetail) {
                destination_address = await connectionDetail.place;
                res.render('googlemapsapi', { session: req.session.theUser, destinationAddress: connectionDetail.place });
            } else {
                res.redirect('myConnections');
            }
        }else{
            res.render('myConnections');
        }    
    }else{
        res.redirect('/');
    }
});


//function for validating the routes
var routingCheck = async function (req, res) {
    var connectionObj;
    if (Object.keys(req.query)[0] === 'connectionID') {
        connectionID = req.query.connectionID;
        connectionObj = await connectionDBUtil.connection(connectionID);
        if (connectionObj) {
            res.render('connection', { conObj: connectionObj, session: req.session.theUser });
        } else {
            res.redirect('/connections');  
        }
    }else{
        res.redirect('/connections');
    }
}

module.exports = {
    ConnectionRouter: router,
    destination_address:destination_address
}
