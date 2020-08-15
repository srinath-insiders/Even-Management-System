//creating a user connection model
var UserConnection = function (Connection, rsvp) {
    this.Connection = Connection;
    this.rsvp = rsvp;
};

module.exports = {
    UserConnection: UserConnection
}
