var a = 2;
$('.message a').click(function () {
  if (a === 2) {
    $("div.isa_error").remove();
    $("div.pass_note").text('Password Note : Minimum length 8, Maximum length 12,Must have uppercase letters, Must have lowercase letters, Must have digits, Should not have spaces');
    a++;
  } else {
    if ($("div.pass_note").text() != '') {
      console.log("sss")
      $("div.pass_note").text('');
      $("div.isa_error").remove();
    } else {
      console.log("oop")

      $("div.pass_note").text('Password Note : Minimum length 8, Maximum length 12,Must have uppercase letters, Must have lowercase letters, Must have digits, Should not have spaces');
    }
  }

  $('form').animate({ height: "toggle", opacity: "toggle" }, "slow");
});


if ('<%=page%>' === 'usersignin') {
  $('div.pass_note').text('Password Note : Minimum length 8, Maximum length 12,Must have uppercase letters, Must have lowercase letters, Must have digits, Should not have spaces');
  a++;
  $('form').animate({ height: "toggle", opacity: "toggle" }, "slow");
}

