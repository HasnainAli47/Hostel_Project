"use strict";
document.addEventListener("DOMContentLoaded", function () {
  var input = document.querySelectorAll(".validate-input .input100");
  var form = document.querySelector('.validate-form');
  form.addEventListener('submit', function(event){
    var check = true;

    for (var i = 0; i < input.length; i++) {
      if (validate(input[i]) === false) {
        showValidate(input[i]);
        check = false;
      }
    }

    if (!check) {
      event.preventDefault();
    }
  });

  document.querySelectorAll('.validate-form .input100').forEach(function (input) {
    input.addEventListener('focus', function () {
      hideValidate(this);
    });
  });

  function validate(input) {
    if (input.getAttribute('type') === 'email' || input.getAttribute('name') === 'email') {
      if (!/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/.test(input.value.trim())) {
        return false;
      }
    } else {
      if (input.value.trim() === '') {
        return false;
      }
    }
  }

  function showValidate(input) {
    var thisAlert = input.parentElement;
    thisAlert.classList.add('alert-validate');
  }

  function hideValidate(input) {
    var thisAlert = input.parentElement;
    thisAlert.classList.remove('alert-validate');
  }
  


  



});
