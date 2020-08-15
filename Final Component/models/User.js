//creating a user model
var User = function (UserID, FirstName, LastName, EmailAddress, Password) {
    this.UserID = UserID;
    this.FirstName = FirstName;
    this.LastName = LastName;
    this.EmailAddress = EmailAddress;
    this.Password = Password;
};


module.exports = {
    User: User
}
