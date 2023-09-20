document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById('contact-form'); // Get the form element
    const btn = document.getElementById('btn'); // Get the submit button element
    let formSubmitted = false; // Initialize a flag to track form submission

    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      if (!formSubmitted) { // Check if the form hasn't been submitted yet
        btn.disabled = true;
        btn.querySelector('input[type="submit"]').value = 'Please Wait';
  
        // You can add any additional processing here, such as AJAX requests
  
        // Set the flag to true to indicate that the form is now being submitted
        formSubmitted = true;
        
        // Now, submit the form programmatically
        contactForm.submit();
      }
    });
  });
  