// document.addEventListener("DOMContentLoaded", function() {
//   const searchBtn = document.getElementById('searchBtn');
//   const restaurantFilter = document.getElementById('Filter2');
//   const hostelFilter = document.getElementById('Filter1');
//   const fastFoodFilter = document.getElementById('sub-Filter5');
//   const boysHostelFilter = document.getElementById('sub-Filter1');

//   // Add a click event listener to the search button
//   searchBtn.addEventListener('click', () => {
//     const searchText = document.getElementById('table_filter').value;
//     console.log(searchText);

//     // Redirect to the search page with the encoded search text
//     window.location.href = `/Search/${encodeURIComponent(searchText)}`;
//   });

// })

// autocomplete.js

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('table_filter');
  const searchBtn = document.getElementById('searchBtn');
  const autocompleteResults = document.getElementById('autocomplete-results');
  const hostelFilter = document.getElementById('Filter1');
  const restaurantFilter = document.getElementById('Filter2');
  const nearbyHostels = document.querySelectorAll('.col.nearby-hostel');
  const nearbyRestaurants = document.querySelectorAll('.col.nearby-restaurant');



  searchBtn.addEventListener('click', function() {
    // Disable the button to prevent multiple clicks
    searchBtn.disabled = true;

    // Change the button text to "Wait"
    searchBtn.textContent = 'Please Wait';
    
  });





  let debounceTimeout;

  // Function to fetch autocomplete suggestions from OpenStreetMap Nominatim API
  async function fetchSuggestions(query) {
      const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`;
      return fetch(apiUrl)
          .then(response => response.json())
          .then(data => data.map(item => item.display_name));
  }

  // Implement autocomplete behavior using debounce
  searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimeout); // Clear the previous timeout

    const query = searchInput.value;
    if (query) {
      debounceTimeout = setTimeout(() => {
        fetchSuggestions(query)
          .then(suggestions => {
            console.log("Now the request gone");
            displayAutocomplete(suggestions);
          })
          .catch(error => {
            console.error('Error fetching autocomplete suggestions:', error);
          });
      }, 500); // Wait for half second after the user stops typing
    } else {
      clearAutocomplete();
    }
  });

  // Display autocomplete suggestions
  function displayAutocomplete(suggestions) {
      const autocompleteHtml = suggestions.map(suggestion => {
          return `<div class="autocomplete-item">${suggestion}</div>`;
      }).join('');
      autocompleteResults.innerHTML = autocompleteHtml;
      autocompleteResults.style.display = 'block';
  }

  // Clear autocomplete suggestions
  function clearAutocomplete() {
      autocompleteResults.innerHTML = '';
      autocompleteResults.style.display = 'none';
  }

  // Handle suggestion click
  autocompleteResults.addEventListener('click', function(event) {
      const clickedItem = event.target;
      if (clickedItem.classList.contains('autocomplete-item')) {
          searchInput.value = clickedItem.innerText;
          clearAutocomplete();
      }
  });

  // Add a click event listener to the search button
  searchBtn.addEventListener('click', () => {
    const searchText = document.getElementById('table_filter').value;

    // Redirect to the search page with the encoded search text
    window.location.href = `/Search/${encodeURIComponent(searchText)}`;
  });


  // Hide autocomplete results when clicking outside
  document.addEventListener('click', function(event) {
      if (!searchInput.contains(event.target) && !autocompleteResults.contains(event.target)) {
          clearAutocomplete();
      }
  });


  // Add click event listeners to the hostel and restaurant filters
  hostelFilter.addEventListener('click', function() {
    toggleNearbyContent('hostel');
  });

  restaurantFilter.addEventListener('click', function() {
    toggleNearbyContent('restaurant');
  });

  function toggleNearbyContent(type) {
    const showHostels = hostelFilter.checked;
  const showRestaurants = restaurantFilter.checked;

  // Show all content if both checkboxes are checked or both are unchecked
  if ((showHostels && showRestaurants) || (!showHostels && !showRestaurants)) {
    nearbyHostels.forEach(hostel => {
      hostel.style.display = 'block';
    });

    nearbyRestaurants.forEach(restaurant => {
      restaurant.style.display = 'block';
    });
  } else {
    nearbyHostels.forEach(hostel => {
      hostel.style.display = showHostels ? 'block' : 'none';
    });

    nearbyRestaurants.forEach(restaurant => {
      restaurant.style.display = showRestaurants ? 'block' : 'none';
    });
  }
  }
  
});
