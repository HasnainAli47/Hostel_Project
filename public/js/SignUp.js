document.addEventListener("DOMContentLoaded", function() {
  // separate-js-file.js
const showPasswordCheckbox = document.getElementById('showPassword');
const passwordInput = document.querySelector('input[name="password"]');
const confirmPasswordInput = document.querySelector('input[name="confirmpassword"]');
const formHolders = document.querySelectorAll(".form-holder input");
const signupButton = document.getElementById('signupButton');
const form = document.querySelector('form');  

showPasswordCheckbox.addEventListener('change', function () {
  const isPasswordVisible = this.checked;
  passwordInput.type = isPasswordVisible ? 'text' : 'password';
  confirmPasswordInput.type = isPasswordVisible ? 'text' : 'password';
});

signupButton.addEventListener('click', function() {
  // Disable the button to prevent multiple clicks
  signupButton.disabled = true;

  // Submit the form
  form.submit();
});
  
    formHolders.forEach(function(input) {
      input.addEventListener("focus", function() {
        // Remove 'active' class from all form holders
        formHolders.forEach(function(holder) {
          holder.parentNode.classList.remove("active");
        });
  
        // Add 'active' class to the parent of the focused input
        this.parentNode.classList.add("active");
      });
    });
  });
  