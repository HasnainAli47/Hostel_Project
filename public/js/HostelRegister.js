document.addEventListener('DOMContentLoaded', function() {
  var searchHostelInput = document.getElementById('searchPlace');
  var hostelNameInput = document.getElementById('hostelName');
  var addressInput = document.getElementById('Adress');
  var placeidInput = document.getElementById('placeid');
  var placelatInput = document.getElementById('placelat');
  var placelngInput = document.getElementById('placelng');
  var rating = document.getElementById('rating');
  var TotalRating = document.getElementById('TotalRating');
  var messDropdown = document.getElementById("messDropdown");


  // Fetch the API key from the server
  fetch('/api/google-maps-api-key')
    .then(response => response.json())
    .then(data => {
      console.log(data.googleMapsApiKey);
      // Use the API key as needed in your client-side code






       // Load Google Maps API dynamically
  function loadGoogleMapsScript(apiKey) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.defer = true;
    script.async = true;

    // Set a callback function to execute after the script is loaded
    script.onload = function() {
      initializeAutocomplete();
    };
    document.head.appendChild(script);



    
  }

  // Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual API key
  // const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';

  loadGoogleMapsScript(data.googleMapsApiKey);






    })
    .catch(error => {
      console.error('Error fetching API key:', error);
    });



    if (messDropdown) {
    messDropdown.addEventListener("change", function() {
      var messPriceInput = document.getElementById("messPrice");
      if (this.value === "yes") {
        messPriceInput.disabled = false;
      } else {
        messPriceInput.disabled = true;
      }
    });
  }
  
  var autocomplete;
  var selectedPlaceId, selectedLat, selectedLng, place_name, formatted_address;

  function initializeAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(searchHostelInput);
    
    autocomplete.addListener('place_changed', fillInAddress);
  }



  function fillInAddress() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return; // No place selected
    }
    

    // Save the selected place's information in variables
    selectedPlaceId = place.place_id || '';
    selectedLat = place.geometry.location.lat() || '';
    selectedLng = place.geometry.location.lng() || '';
    hostelNameInput.value = place.name || '';
    addressInput.value = place.formatted_address || '';
    placeidInput.value = selectedPlaceId;
    placelatInput.value = selectedLat;
    placelngInput.value = selectedLng;
    rating.value = place.rating != undefined ? place.rating : 0;
    TotalRating.value = (place.user_ratings_total) != undefined ? place.user_ratings_total : 0;

    // Update the hidden input fields with the selected place's information
    document.getElementById('actualHostelName').value = place.name || '';
    document.getElementById('actualAddress').value = place.formatted_address || '';
    // document.getElementById('placeid').value = place.place_id || '';
    // document.getElementById('placelat').value = selectedLat;
    // document.getElementById('placelng').value = selectedLng;


    
  }

  var timer; // To store the timer ID

  searchHostelInput.addEventListener('input', function() {
    clearTimeout(timer); // Clear any existing timer
    timer = setTimeout(fetchAutocomplete, 1000); // Set a new timer after 1 second
  });

  function fetchAutocomplete() {
    var inputValue = searchHostelInput.value;
    
    if (inputValue.trim() !== '') {
      // Fetch autocomplete suggestions from the Google Maps API here
      // For example:
      // autocomplete.getPlacePredictions({ input: inputValue }, function(results, status) {
      //   if (status === google.maps.places.PlacesServiceStatus.OK) {
      //     // Process the autocomplete suggestions
      //   }
      // });
    }
  }





});
