//importing the modules
var workshopobj = require('./../models/connection');
var mongoose = require('mongoose');
var db = 'mongodb://localhost/workshop';
var Schema = mongoose.Schema;

//creating a userConnection Model
var userConnectionsDb = mongoose.model('Userconnection', new Schema({
    userId: String,
    connectionId: String,
    connectionType: String,
    rsvp: String,
    connectionName: String
}));

//connecting to the database
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).
    catch(error => handleError(error));

//function for getting a userprofile using UserID
var getUserProfile = async function (userID) {
    var userconnections = [];
    await userConnectionsDb.find({
        userId: userID
    }).exec().then((userconnectionsObj) => {
        userconnections = userconnectionsObj;
    }).catch((err) => {
        console.log(err);
    });
    return userconnections;
}

//updating particular connection details
var updateRespectiveConnectionDetails = async function (connectionObj) {
    await userConnectionsDb.updateMany(
        { connectionId: connectionObj.workshopId },
        { $set: { connectionType: connectionObj.workshopType, connectionName: connectionObj.workshopName } }
    ).exec().then((userConnection) => {
        if (userConnection) {
            updation = true;
        }
    }).catch((err) => {
        console.log(err);
    });

}

//updating RSVP
var updateRsvp = async function (connectionId, userId, rsvp) {
    var updation = false;
    await userConnectionsDb.findOneAndUpdate(
        { userId: userId, connectionId: connectionId },
        { $set: { rsvp: rsvp } }
    ).exec().then((userConnection) => {
        if (userConnection) {
            updation = true;
        }
    }).catch((err) => {
        console.log(err);
    });
    return updation;
}

// removing a user connection
var removeUserConnection = async function (connectionId, userId) {
    userConnectionsDb.deleteOne({ userId: userId, connectionId: connectionId }, function (err) {
        if (err) return handleError(err);
    });
}

//remove a connection created by the user
var removeUserCreatedConnection = async function (connectionId, userId) {
    userConnectionsDb.deleteMany({ connectionId: connectionId }, function (err) {
        if (err) return handleError(err);
    });
}

//adding RSVP
var addRsvp = async function (connectionObj, userId, rsvp) {
    var adduserConnection = new userConnectionsDb({
        userId: userId,
        connectionId: connectionObj.workshopId,
        connectionType: connectionObj.workshopType,
        rsvp: rsvp,
        connectionName: connectionObj.workshopName
    });

    await adduserConnection.save(function (err, addedConnection) {
        if (err) return console.error(err);
    });
}

module.exports = {
    userconnections: getUserProfile,
    updateUserConnection: updateRsvp,
    addUserConnection: addRsvp,
    removeUserConnection: removeUserConnection,
    removeUserCreatedConnection: removeUserCreatedConnection,
    updateRespectiveConnectionDetails: updateRespectiveConnectionDetails
};

