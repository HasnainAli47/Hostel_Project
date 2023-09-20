document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  
    navLinks.forEach(function(link) {
      if (link.href === window.location.href) {
        link.classList.add("active");
      }
  
      link.addEventListener("click", function(event) {
        navLinks.forEach(function(navLink) {
          navLink.classList.remove("active");
        });
  
        link.classList.add("active");
      });
    });
  });
  