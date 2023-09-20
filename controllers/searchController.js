const axios = require('axios');
const geolib = require('geolib');
const SearchResult = require('./../models/searchResult')
const Hostel = require('./../models/Hostels');
const Restaurant = require('./../models/Restaurants');
const sharp = require('sharp')
const Images = require('./../models/Images');
const { Mutex } = require('async-mutex');
// Create a mutex instance
const mutex = new Mutex();



// Controller to handle the /Search route
exports.getSearchPage = (req, res) => {
  const isLoggedIn = req.session.user ? true : false;
  const messages = req.flash();
  res.render('Search_Page', { messages, user: req.session.user, isLoggedIn }); // Pass the user object to the view if needed
};








async function calculateDistance(lat1, lon1, lat2, lon2) {
  const point1 = { latitude: lat1, longitude: lon1 }; // San Francisco
  const point2 = { latitude: lat2, longitude: lon2 };
  // Calculate the distance between the two points
  const distance = geolib.getDistance(point1, point2);
  return (distance/1000).toFixed(1);
}



const getPlaceInfo = async (place, userLocation) => {
  const { name, place_id, types, vicinity, formatted_address, formatted_phone_number, rating, user_ratings_total, photos } = place;
  

  const category = types.includes('restaurant') ? 'Restaurant' : types.includes('lodging') ? 'Hostel/Hotel' : 'Unknown'; // You can customize this based on the place types

  const distanceInKm = await calculateDistance(userLocation.lat, userLocation.lng, place.geometry.location.lat,  place.geometry.location.lng);
  const pictureUrl = photos && photos.length > 0 ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}` : null;
  const finalRating = rating !== undefined ? rating : 0;
  const finalUserRatingsTotal = user_ratings_total !== undefined ? user_ratings_total : 0;

  const placeInfo = {
    name,
    place_id,
    category,
    address: formatted_address || vicinity,
    contactNumber: formatted_phone_number || 'Not available',
    distance: distanceInKm,
    finalRating,
    totalReviews: finalUserRatingsTotal,
    imageUrl: pictureUrl,
    lat: place.geometry.location.lat, 
    lng: place.geometry.location.lng
  };

  return placeInfo;
};


// Image processing and conversion function
const processAndConvertImage = async (imageUrl) => {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const imageBuffer = Buffer.from(response.data, 'binary');
  const processedImageBuffer = await sharp(imageBuffer)
    .resize({ width: 400 }) // Adjust width as needed
    .toFormat('jpeg')       // Convert to JPEG format
    .toBuffer();
  return processedImageBuffer;
};




exports.getSearch = async (req, res) => {
  const searchQuery = req.params.searchQuery;

  

  const nominatimApiUrl = 'https://nominatim.openstreetmap.org/search';

  try {
    // Make a request to the OpenStreetMap Nominatim API to get lat/lng of the place
    const nominatimResponse = await axios.get(nominatimApiUrl, {
      params: {
        q: searchQuery,
        format: 'json',
      },
    });
    if(nominatimResponse.data.length > 0){

    

    // Extract the lat/lng from the API response
    const { lat, lon: lng } = nominatimResponse.data[0];

    
    const existingResult = await SearchResult.findOne({ lat: lat, lng: lng })
    .populate({
      path: 'hostels.hostel',
      model: 'Hostel',
    })
    .populate({
      path: 'restaurants.restaurant', // Corrected typo here
      model: 'Restaurant',
    });

  if (existingResult) {
    // Use the existing result from the database
  const nearbyHostelsArray = existingResult.hostels.map(hostelObj => {
    const { hostel, distance } = hostelObj;
    const { imageId, ...rest } = hostel.toObject();
    return {
      ...rest,
      distance, // Add the distance property
      imageUrl: imageId ? `/images/${imageId}.jpg` : null,
    };
  });
    const nearbyRestaurantsArray = existingResult.restaurants.map(restaurantobj => {
      const { restaurant, distance } = restaurantobj;
      const { imageId, ...rest } = restaurant.toObject();
      return {
        ...rest,
        distance, // Add the distance property
        imageUrl: imageId ? `/images/${imageId}.jpg` : null,
      }
    });


    const isLoggedIn = req.session.user ? true : false;
    const messages = req.flash();
    console.log("Database");
    res.render('Search_Page', { messages, isLoggedIn, user: req.session.user, nearbyHostels: nearbyHostelsArray, nearbyRestaurants: nearbyRestaurantsArray });
  
  }else{
    // Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual Google Maps API key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

     // Google Maps Places API endpoint for nearby search
     const apiUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
     var response;
 
     try {
       // Make a request to the Google Maps API
       response = await axios.get(apiUrl, {
         params: {
           location: `${lat},${lng}`, // Assuming the searchQuery is in the format "latitude,longitude"
           rankby: 'distance', // Prioritize results by distance
           // radius: 50000,
           type: 'restaurant', // Limiting results to lodging places (which includes hostels)
           // keyword: 'hostel',
           key: apiKey,
         },
       });

      // Make a request to the Google Maps API for hostels
      var hostelResponse = await axios.get(apiUrl, {
        params: {
          location: `${lat},${lng}`,
          rankby: 'distance',
          type: 'lodging',
          key: apiKey,
        },
      });
     } catch (error) {
       // Handle any errors that occur during the API request
       console.error('Error fetching lat and lag.', error);
       res.status(500).send('Error getting place latitude and longitude');
     }

     // Extract the relevant data from the hostel API response
    const nearbyHostels = hostelResponse.data.results;
    const nearbyRestaurants = response.data.results;

    // Initialize empty arrays for each category
    const nearbyHostelsArray = [];
    const nearbyRestaurantsArray = [];
    const userLocation = { lat, lng }; // Assuming the searchQuery is in the format "latitude,longitude"
    
    // Iterate through each place to get the place info and append to the respective category array
    for (const place of nearbyHostels) {
      const placeInfo = await getPlaceInfo(place, userLocation);

      // Append to the respective category array
      if (placeInfo.category === 'Hostel/Hotel') {
        nearbyHostelsArray.push(placeInfo);    
    }
  }

    // Resturants
for (const place of nearbyRestaurants) {
  const placeInfo = await getPlaceInfo(place, userLocation);
  
    // Append to the respective category array
    if (placeInfo.category === 'Restaurant') {
      nearbyRestaurantsArray.push(placeInfo);
    }
}

    // Send the nearby hostels' info back in the response
    const isLoggedIn = req.session.user ? true : false;
    const messages = req.flash();
    res.render('Search_Page', { messages, isLoggedIn, user: req.session.user, nearbyHostels: nearbyHostelsArray, nearbyRestaurants: nearbyRestaurantsArray });
    
    // Inside your route handler
  const release = await mutex.acquire();


  try{
    const { lat, lon: lng } = nominatimResponse.data[0];

    // Check if search result already exists in the database
    const existingResult = await SearchResult.findOne({ lat: lat, lng: lng })
      .populate('hostels')
      .populate('restaurants');


      if(!existingResult){

    // Create an array to store the hostels that need to be saved
    const newHostelsToSave = [];
    const oldHostels = []
    const newRestaurantsToSave = [];
    const oldRestaurants = []
    const userLocation = { lat, lng }; // Assuming the searchQuery is in the format "latitude,longitude"

    // Iterate through each place to get the place info and append to the respective category array
    for (const place of nearbyHostels) {
      
      // Check if a document with the same latitude and longitude exists in the database
      const existingHostel = await Hostel.findOne({ place_id: place.place_id });
      if (existingHostel) {
        oldHostels.push({ ...existingHostel.toObject(), _id: existingHostel._id });
      } else {
        const placeInfo = await getPlaceInfo(place, userLocation);
      // Append to the respective category array
      if (placeInfo.category === 'Hostel/Hotel') {
        newHostelsToSave.push(placeInfo);
      }

        // Image processing
    if (placeInfo.imageUrl) {
      const processedImageBuffer = await processAndConvertImage(placeInfo.imageUrl);
      // Save processed image to database
      const hostelImage = new Images({
        image: { data: processedImageBuffer, contentType: 'image/jpeg' }, // Adjust contentType as needed
      });
      await hostelImage.save();
      placeInfo.imageId = hostelImage._id;
    }
    }
  }

    // Resturants
for (const place of nearbyRestaurants) {
  
  // Check if a document with the same latitude and longitude exists in the database
  const existingRestaurant = await Restaurant.findOne({ place_id: place.place_id});
  if (existingRestaurant) {
    oldRestaurants.push({ ...existingRestaurant.toObject(), _id: existingRestaurant._id }); // Push the existing _id
  } else {
    const placeInfo = await getPlaceInfo(place, userLocation);
    // Append to the respective category array
    if (placeInfo.category === 'Restaurant') {
      newRestaurantsToSave.push(placeInfo);
    }
    
    // Image processing
    if (placeInfo.imageUrl) {
      const processedImageBuffer = await processAndConvertImage(placeInfo.imageUrl);
      // Save processed image to database
      const restaurantImage = new Images({
        image: { data: processedImageBuffer, contentType: 'image/jpeg' }, // Adjust contentType as needed
      });
      await restaurantImage.save();
      placeInfo.imageId = restaurantImage._id;
    }
  }
}


    

    // Create new instances of Hostel and Restaurant models and save them
    const hostelsToSave = newHostelsToSave.map(({ distance, ...hostel }) => new Hostel(hostel));
    const restaurantsToSave = newRestaurantsToSave.map(restaurant => new Restaurant(restaurant));

    await Promise.all([...hostelsToSave, ...restaurantsToSave].map(item => item.save()));

    //All hostels to save
    // Combine old hostels and hostels to save
    const combinedHostels = [...oldHostels, ...hostelsToSave];
    const combinedRestaurants = [...oldRestaurants, ...restaurantsToSave];
    const hostelsWithDistance = [];
    const restaurantsWithDistance = [];

    for (const hostel of combinedHostels) {
      const distance = hostel.distance || await calculateDistance(userLocation.lat, userLocation.lng, hostel.lat, hostel.lng);
      hostelsWithDistance.push({
        hostel: hostel._id,
        distance: distance,
      });
    }

    for (const restaurant of combinedRestaurants) {
      const distance = restaurant.distance || await calculateDistance(userLocation.lat, userLocation.lng, restaurant.lat, restaurant.lng);
      restaurantsWithDistance.push({
        restaurant: restaurant._id,
        distance: distance,
      });
    }

    // Create a new search result entry and link hostels and restaurants
    const newSearchResult = new SearchResult({
      query: searchQuery,
      lat: lat,
      lng: lng,
      hostels: hostelsWithDistance,
      restaurants: restaurantsWithDistance
    });
    await newSearchResult.save();
    






      // Define a constant to represent the distance (in kilometers) for nearby hostels
const nearbyDistance = 10; // Adjust as needed

// Calculate the latitude and longitude ranges based on the nearby distance
const latRange = nearbyDistance / 111; // 1 degree of latitude is approximately 111 kilometers
const lngRange = (nearbyDistance / 111) / Math.cos(Number(lat) * (Math.PI / 180));  // Adjust for varying longitude distances

// Adjust the query to use the calculated ranges
const nearbyHostels1 = await Hostel.find({
  IsRegister: true,
  lat: { $gte: lat - latRange, $lte: Number(lat) + latRange },
  lng: { $gte: lng - lngRange, $lte: Number(lng) + lngRange },
});

// Calculate nearby restaurants
const nearbyRestaurants1 = await Restaurant.find({
  IsRegister: true,
  lat: { $gte: lat - latRange, $lte: Number(lat) + latRange },
  lng: { $gte: lng - lngRange, $lte: Number(lng) + lngRange },
});

// Step 2: Update corresponding searchResults with nearby hostels
for (const hostel of nearbyHostels1) {
  const distance = await calculateDistance(lat, lng, hostel.lat, hostel.lng);
  console.log(distance);

  await SearchResult.findOneAndUpdate(
    { lat: lat, lng: lng },
    {
      $push: {
        hostels: {
          hostel: hostel._id,
          distance: distance,
        },
      },
    }
  );
}


for (const restaurant of nearbyRestaurants1) {
  const restaurantDistance = await calculateDistance(lat, lng, restaurant.lat, restaurant.lng);

  await SearchResult.findOneAndUpdate(
    { lat: lat, lng: lng },
    {
      $push: {
        restaurants: {
          restaurant: restaurant._id,
          distance: restaurantDistance,
      },
    },
    
    }
  
    );

}

  }
  }finally {
    release()
  }
}
    }else{
      const isLoggedIn = req.session.user ? true : false;
      // const messages = 
      res.render('Search_Page', {  isLoggedIn, user: req.session.user});
    }
    
    
   

    } catch (error) {
    // Handle any errors that occur during the API request
    console.error('Error fetching nearby hostels:', error);
    res.status(500).send('Error fetching nearby hostels');
  }
};
