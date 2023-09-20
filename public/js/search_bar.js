document.addEventListener("DOMContentLoaded", function() {
  const radio1 = document.getElementById("radio1");
  const radio2 = document.getElementById("radio2");
  const radio3 = document.getElementById("radio3");
  const subOptions1 = document.getElementById("sub-option1");
  const subOptions2 = document.getElementById("sub-option2");
  const subOptions3 = document.getElementById("sub-option3");
  const subOptions4 = document.getElementById("sub-option4");

  radio1.addEventListener("change", function() {
    if (radio1.checked) {
      subOptions1.style.display = "block";
      subOptions2.style.display = "block";
      subOptions3.style.display = "none";
      subOptions4.style.display = "none";
    }
  });

  radio2.addEventListener("change", function() {
    if (radio2.checked) {
      subOptions1.style.display = "none";
      subOptions2.style.display = "none";
      subOptions3.style.display = "block";
      subOptions4.style.display = "block";
    }
  });

  radio3.addEventListener("change", function() {
    if (radio3.checked) {
      // Handle logic for Hotels sub-options here
    }
  });

  // Get the search input element
  const searchInput = document.getElementById("search-input");

  // Add event listener for input event
  searchInput.addEventListener("input", onSearchInput);

  // Function to handle input event
  function onSearchInput() {
    const searchQuery = searchInput.value;

    // Fetch autocomplete suggestions from Nominatim
    fetch(`https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json`)
      .then(response => response.json())
      .then(data => {
        // Process the autocomplete suggestions here (data array)
        // You can display the suggestions to the user in a dropdown, for example
      })
      .catch(error => {
        console.error("Error fetching autocomplete suggestions:", error);
      });
  }

  // Function to handle the search button click
  function search() {
    const searchQuery = searchInput.value;

    // Perform your search action here with the searchQuery
    // For example, you might want to use the searchQuery to filter your search results
    // and display the matching hostels, hotels, and restaurants to the user
  }
});
