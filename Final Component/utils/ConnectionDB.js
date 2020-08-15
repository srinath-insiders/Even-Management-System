//implementing required modules
var workshopobj = require('./../models/connection');
var mongoose = require('mongoose');
var db = 'mongodb://localhost/workshop';
var Schema = mongoose.Schema;

//Creating a model for connection 
var connectionsDb = mongoose.model('Connection', new Schema({
    workshopId: String,
    workshopName: String,
    workshopType: String,
    place: String,
    details: String,
    date: String,
    image: String,
    createdby: String
}));

//connecting to the database 
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).
    catch(error => handleError(error));

//retrieving distinct connection type
var getDistinctConnectionType = async function () {
    var connectionTypeList = [];
    await connectionsDb.distinct("workshopType").exec().then((connectionType) => {
        connectionTypeList = connectionType;
    }).catch((err) => {
        console.log(err);
    });
    return connectionTypeList;
}

//retrieving the list of connections
var getConnections = async function () {
    var connectionList = [];
    await connectionsDb.find({}).exec().then((connection) => {
        connectionList = connection;
    }).catch((err) => {
        console.log(err);
    });

    return connectionList;
}

//function for fetching a connection based on email
var getConnectionsOfParticularUser = async function (email) {
    var userCreatedconnections = [];
    await connectionsDb.find({
        createdby: email
    }).exec().then((userconnectionsObj) => {
        userCreatedconnections = userconnectionsObj;
    }).catch((err) => {
        console.log(err);
    });
    return userCreatedconnections;
}

//fetching a connection based on workshop ID
var getConnection = async function (Id) {
    var WorkshopObj;
    await connectionsDb.findOne({
        workshopId: Id
    }).exec().then((workshop) => {
        if (workshop) {
            WorkshopObj = new workshopobj.Workshop(workshop.workshopId, workshop.workshopName, workshop.workshopType, workshop.place, workshop.details, workshop.date, workshop.image, workshop.createdby);
        }
    }).catch((err) => {
        console.log(err);
    });
    return WorkshopObj;
}


//removing user created connection
var removeUserCreatedConnection = async function (connectionId) {
    connectionsDb.deleteOne({ workshopId: connectionId }, function (err) {
        if (err) return handleError(err);
    });
}

//adding a new connection
var addNewConnection = async function (connectionObj) {
    var addNewConnection = new connectionsDb({
        workshopId: connectionObj.workshopId,
        workshopName: connectionObj.workshopName,
        workshopType: connectionObj.workshopType,
        place: connectionObj.place,
        details: connectionObj.details,
        date: connectionObj.date,
        image: connectionObj.image,
        createdby: connectionObj.createdby
    });
    await addNewConnection.save(function (err, addedConnection) {
        if (err) return console.error(err);
    });
}

//updating the new connection
var updateNewConnection = async function (connectionObj) {
    var updation = false;
    await connectionsDb.findOneAndUpdate(
        { workshopId: connectionObj.workshopId },
        {
            $set: {
                workshopName: connectionObj.workshopName, workshopType: connectionObj.workshopType
                , place: connectionObj.place, details: connectionObj.details, date: connectionObj.date
            }
        }
    ).exec().then((userConnection) => {
        if (userConnection) {
            updation = true;
        }
    }).catch((err) => {
        console.log(err);
    });
    return updation;
}


module.exports = {
    connections: getConnections,
    connection: getConnection,
    connectionsType: getDistinctConnectionType,
    addNewConnection: addNewConnection,
    getConnectionsOfParticularUser: getConnectionsOfParticularUser,
    removeUserCreatedConnection: removeUserCreatedConnection,
    updateNewConnection: updateNewConnection
};