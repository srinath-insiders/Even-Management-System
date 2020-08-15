//method for validating connection ID
var validateConnectionId = function (Id) {
  var letterNumber = /^[0-9a-zA-Z]+$/;
  if ((Id.match(letterNumber))) {
    return true;
  }
  else {
    console.log('not valid');
    return false;
  }
}


module.exports = {
  ConnectionIdValidator: validateConnectionId
}