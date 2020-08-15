//importing required modules
var userConnection = require('./UserConnection');
var connectionDBUtil = require('./../utils/ConnectionDB');
var userConnectionDBUtil = require('./../utils/UserConnectionDB');

//creating user profile
var UserProfile =
    function (UserId, UserConnectionList, UserCreatedConnectionList) {
        this.UserId = UserId;
        this.UserConnectionList = UserConnectionList;
        this.UserCreatedConnectionList = UserCreatedConnectionList;
        this.addConnection = async function (Connection, rsvp) {
            var update = false;
            var connectionObj;
            if (this.UserConnectionList == undefined || this.UserConnectionList.length == 0) {
                // add new connection
                connectionObj = await connectionDBUtil.connection(Connection);
                await userConnectionDBUtil.addUserConnection(connectionObj, this.UserId, rsvp);
            } else {
                connectionObj = await connectionDBUtil.connection(Connection);
                update = await this.updateConnection(new userConnection.UserConnection(connectionObj, rsvp));
                if (update === false) {
                    await userConnectionDBUtil.addUserConnection(connectionObj, this.UserId, rsvp);
                }
            }
        }
        //implementing getConnections to retrieve list of connections
        this.getConnections = async function () {
            this.UserConnectionList = await userConnectionDBUtil.userconnections(this.UserId);
            return this.UserConnectionList;
        }
        //function for removing a connection
        this.removeConnection = async function (connectionId) {
            await userConnectionDBUtil.removeUserConnection(connectionId, this.UserId);
        }
        //function for updating a connection
        this.updateConnection = async function (UserConnection) {
            var update = false;
            update = await userConnectionDBUtil.updateUserConnection(UserConnection.Connection.workshopId, this.UserId, UserConnection.rsvp);
            return update;
        }
        //user profile reset
        this.emptyProfile = function () {
            this.UserConnectionList = [];
        }

        this.removeUserCreatedConnection = async function (connectionId) {
            await connectionDBUtil.removeUserCreatedConnection(connectionId);
            await userConnectionDBUtil.removeUserCreatedConnection(connectionId);
        }



    };





module.exports = {
    UserProfile: UserProfile
}
