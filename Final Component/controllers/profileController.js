//importing the modules
var express = require('express');
var router = express.Router();
var connectionDBUtil = require('./../utils/ConnectionDB');
var userConnectionDBUtil = require('./../utils/UserConnectionDB');
var User = require('./../models/User');
var UserList = require('./../utils/UserDB');
var userConnection = require('./../models/UserConnection');
var userProfileObj = require('./../models/UserProfile');
var UserConnectionList = [];
var UserProfile;
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
var passwordValidator = require('password-validator');
var schema = new passwordValidator();
const { sanitizeBody } = require('express-validator');
var urlencodedParser = bodyParser.urlencoded({ extended: false });


// XSS filter
const helmet = require('helmet')

// Sets "X-XSS-Protection: 1; mode=block".
router.use(helmet.xssFilter())


// importing Cryto npm package
var encryptDecryptUtility = require('./../utils/PasswordUtility');

schema
    .is().min(8)                                    // Minimum length 8
    .is().max(12)                                  // Maximum length 12
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                 // Must have digits
    .has().not().spaces()                           // Should not have spaces

// Stores a user's profile contents in the session and saves a user's rsvp for a connection
router.get('/', async function (req, res) {

    if (req.session.theUser === undefined) {
        res.redirect('/login');
    } else if (req.session.theUser) {
        UserConnectionList = await userConnectionDBUtil.userconnections(req.session.theUser.UserID);
        var usercreatedConnectionList = await connectionDBUtil.getConnectionsOfParticularUser(req.session.theUser.EmailAddress);
        UserProfile = new userProfileObj.UserProfile(req.session.theUser.UserID, UserConnectionList,usercreatedConnectionList);
        req.session.theUser.UserProfile = UserProfile;
        req.session.theUser.UserCreatedConnectionList =  usercreatedConnectionList;
        res.render('savedConnections', { data: req.session.theUser.UserProfile, session: req.session.theUser });
    }
});


// Performs delete from the user's connection list
router.post('/update', urlencodedParser,  sanitizeBody('notifyOnReply').toBoolean(),async function (req, res) {
    if (req.body.formValue === 'Update') {
        var connectionID;
        if (Object.keys(req.query)[0] === 'connectionID') {
            connectionID = req.query.connectionID;
            res.redirect('/connection?connectionID=' + connectionID)
        }
    } else if (req.body.formValue === 'Delete') {
        if (req.session.theUser) {
            if (Object.keys(req.query)[0] === 'connectionID') {
                connectionID = req.query.connectionID;
                await UserProfile.removeConnection(connectionID);
                req.session.theUser.UserProfile = UserProfile;
                res.redirect('/myConnections');
            }
        } else {
            res.redirect('/')
        }
    }
});

//router for updating the connections
router.post('/updateConnectionsList', urlencodedParser,  sanitizeBody('notifyOnReply').toBoolean(),async function (req, res) {
    if (req.body.formValue === 'Update') {
        var connectionID;
        var connectionObj;
        if (Object.keys(req.query)[0] === 'connectionID') {
            connectionID = req.query.connectionID;
            connectionObj = await connectionDBUtil.connection(connectionID);
            res.render('updateNewConnection', { session: req.session.theUser,data:connectionObj, error: null });      
        }
    } else if (req.body.formValue === 'Delete') {
        if (req.session.theUser) {
            if (Object.keys(req.query)[0] === 'connectionID') {
                connectionID = req.query.connectionID;
                await UserProfile.removeUserCreatedConnection(connectionID);
                req.session.theUser.UserProfile = UserProfile;
                res.redirect('/myConnections');
            }
        } else {
            res.redirect('/')
        }
    }
});

//router for RSVP
router.post('/rsvp', urlencodedParser,  sanitizeBody('notifyOnReply').toBoolean(),async function (req, res) {
    var connectionID;

    if (req.session.theUser) {
        if (Object.keys(req.query)[0] === 'connectionID') {
            connectionID = req.query.connectionID;
            await UserProfile.addConnection(connectionID, req.body.formValue);
            req.session.theUser.UserProfile = UserProfile;
            res.redirect('/myConnections');
        } else {
            res.redirect('/connections');
        }
    } else {
        res.redirect('/connections');
    }

});

// Logouts a User
router.get('/logout', function (req, res) {
    UserConnectionList = [];
    UserProfile = undefined;
    req.session.theUser = undefined;
    req.session.destroy();
    res.redirect('/');
});

//Sign in router
router.post('/usersignin', urlencodedParser,
    //validating userid
    check('userid').custom(value => {
    if (value) {
        return /^[a-zA-Z0-9]*$/.test(value)
    } else {
        return Promise.reject('User Id should not be empty');
    }
}).withMessage('User Id should contain only alphabets and Numbers'),
    //validating userid
    check('userid').custom(async (value,  { req }) => {
    if (value) {
        var user = await UserList.getUser(value);
        if(user){
            return Promise.reject('User Id already exists.');
        }else{
            return true;
        }
    } else {
        return true;
    }
}),
//validating the first name field
    check('firstname').custom(value => {
        if (value) {
            return /^[a-zA-Z ]*$/.test(value)
        } else {
            return Promise.reject('First Name should not be empty');
        }
    }).withMessage('First Name should contain only alphabets'),

    check('lastname').custom(value => {
        if (value) {
            return /^[a-zA-Z ]*$/.test(value)
        } else {
            return Promise.reject('Last Name should not be empty');
        }
    }).withMessage('Last Name should contain only alphabets'),
    check('newpassword').custom(value => {
        var validate = schema.validate(value);
        if (value === '') {
            return Promise.reject('Please enter your new password');
        } else if (validate === false) {
            return Promise.reject('New Password is not valid. ');
        } else {
            return true;
        }
    }),
    check('confirmpassword').custom((value, { req }) => {
        if (value) {
            if (value != req.body.newpassword) {
                return Promise.reject('Password does not match');
            } else {
                return true;
            }
        } else {
            return Promise.reject('Please enter the confirm password field');
        }
    })
    ,
//validating email field
    check('email').isEmail().withMessage('Please enter a valid email address'),
    check('email').custom(async (value,  { req }) => {
        if (value) {
            var user = await UserList.getUserBasedonEmail(value);
            if(user){
                return Promise.reject('Mail already exists.');
            }else{
                return true;
            }
        } else {
            return true;
        }
    }), sanitizeBody('notifyOnReply').toBoolean(),
    async function (req, res) {
        var errors = await validationResult(req);
        if (!errors.isEmpty()) {
            res.render('login', { session: req.session.theUser, error: errors.array(), page: 'usersignin' });
        } else {
            var password = await encryptDecryptUtility.encrypt(req.body.newpassword);
            var newUser = new User.User(req.body.userid, req.body.firstname, req.body.lastname, req.body.email, password );
            await UserList.createNewUser(newUser);
            res.render('login', { session: req.session.theUser, error: errors.array(), page: 'userlogin' });
        }
    });


//user login route    
router.post('/userlogin', urlencodedParser,
    check('email').isEmail().withMessage('Please enter a valid email address'),
    check('password').custom(value => {

        var validate = schema.validate(value);
        if (value === '') {
            return Promise.reject('Please enter your password');
        } else if (validate === false) {
            return Promise.reject('Password is not valid. Note : Minimum length 8, Maximum length 12,Must have uppercase letters, Must have lowercase letters, Must have digits, Should not have spaces ');
        } else {
            return true;
        }
    }), sanitizeBody('notifyOnReply').toBoolean(), async function (req, res) {
        var errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('login', { session: req.session.theUser, error: errors.array(), page: 'userlogin' });
        } else {
            if (req.session.theUser) {
                res.redirect('/myConnections');
            } else {
                var user = await UserList.getUserBasedonEmail(req.body.email);
                if (user) {
                    var ans = await encryptDecryptUtility.decrypt(user.Password);

                    if (ans === req.body.password) {
                        req.session.theUser = new User.User(user.UserID, user.FirstName, user.LastName, user.EmailAddress, user.Password);
                        res.redirect('/myConnections');
                    } else {
                        res.render('login', {
                            session: req.session.theUser, error: [{
                                'msg': 'Username/Password is Invalid',
                            }], page: 'userlogin'
                        });
                    }
                } else {
                    res.render('login', {
                        session: req.session.theUser, error: [{
                            'msg': 'Username/Password is Invalid',
                        }], page: 'userlogin'
                    });
                }
            }
        }

    });

module.exports = {
    ProfileRouter: router
}