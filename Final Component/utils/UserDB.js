//importing the modules
var user = require('./../models/User');
var mongoose = require('mongoose');
var db = 'mongodb://localhost/workshop';
var Schema = mongoose.Schema;
var User = require('./../models/User');

//creating a user model
var userDb = mongoose.model('User', new Schema({
    userId: String,
    firstName: String,
    lastName: String,
    emailAddress: String,
    password: Object
}));

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).
    catch(error => handleError(error));

//getting users information
var getUsers = async function () {
    var userList = [];
    await userDb.find({}).exec().then((user) => {
        userList = user;
    }).catch((err) => {
        console.log(err);
    });
    return userList;
}

//getting a user info based on user ID
var getUser = async function (Id) {
    var userObj;
    await userDb.findOne({
        userId: Id
    }).exec().then((user) => {
        if (user) {
            userObj = new User.User(user.userId, user.firstName, user.lastName, user.emailAddress, user.password);
        }

    }).catch((err) => {
        console.log(err);
    });
    return userObj;
}

//getting user info based on user's email
var getUserBasedonEmail = async function (Email) {
    var userObj;
    await userDb.findOne({
        emailAddress: Email
    }).exec().then((user) => {
        if (user) {
            userObj = new User.User(user.userId, user.firstName, user.lastName, user.emailAddress, user.password);
        }
    }).catch((err) => {
        console.log(err);
    });

    return userObj;
}

//creating a new user
var createNewUser = async function (user) {
    var addNewUser = new userDb({
        userId: user.UserID,
        firstName: user.FirstName,
        lastName: user.LastName,
        emailAddress: user.EmailAddress,
        password: user.Password
    });
    await addNewUser.save(function (err, addedConnection) {
        if (err) return console.error(err);
    });

}



module.exports = {
    getUsers: getUsers,
    getUser: getUser,
    getUserBasedonEmail: getUserBasedonEmail,
    createNewUser: createNewUser
};






