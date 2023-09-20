const axios = require('axios');
const Hostel = require('../models/Hostels');
const SearchResult = require('../models/searchResult');
const Restaurant = require('../models/Restaurants');
const Users = require('../models/users');

// Function to render details for a place
exports.getDetails = async (req, res) => {
  const place_id = req.params.details;

  try {
    // Find the hostel or restaurant using place_id
    const hostel = await Hostel.findOne({ place_id: place_id });
    const restaurant = await Restaurant.findOne({ place_id: place_id });

    if (hostel) {
      // Now you need to find the distance of this hostel from the searchResult table
      const searchResult = await SearchResult.findOne({
        'hostels.hostel': hostel._id,
      });

      if (!searchResult) {
        return res.status(404).send('Hostel distance data not found');
      }

      // Find the specific distance entry for this hostel
      const distanceEntry = searchResult.hostels.find(entry =>
        entry.hostel.equals(hostel._id)
      );

      if (!distanceEntry) {
        return res.status(404).send('Hostel distance entry not found');
      }

      // Now you can use the distance value from the distanceEntry object
      const distance = distanceEntry.distance;
      const { imageId, ...rest } = hostel;

      const isLoggedIn = req.session.user ? true : false;
      const messages = req.flash();
      const user = isLoggedIn === true ? await Users.findById(req.session.user._id) : undefined;

      res.render('Hostel Details Page', {
        user,
        isLoggedIn,
        messages,
        hostel: rest._doc,
        distance,
        imageUrl: imageId ? `/images/${imageId}.jpg` : null,
      });
    } else if (restaurant) {
      
        // Now you need to find the distance of this hostel from the searchResult table
        const searchResult = await SearchResult.findOne({
            'restaurants.restaurant': restaurant._id
        });

        if (!searchResult) {
            // Handle case when distance data is not found
            return res.status(404).send('Hostel distance data not found');
        }

        // Find the specific distance entry for this hostel
        const distanceEntry = searchResult.restaurants.find(entry => entry.restaurant.equals(restaurant._id));

        if (!distanceEntry) {
            // Handle case when distance entry is not found
            return res.status(404).send('Hostel distance entry not found');
        }

        // Now you can use the distance value from the distanceEntry object
        const distance = distanceEntry.distance;
        const { imageId, ...rest } = restaurant;

        console.log("Dealing in restaurant");



        const isLoggedIn = req.session.user ? true : false;
        const messages = req.flash();
        const user = isLoggedIn === true ? await Users.findById(req.session.user._id) : undefined;

        // Render the details page with the hostel details and its distance
        res.render('Restaurant Details Page', {user, messages, isLoggedIn,  restaurant: rest._doc, distance, imageUrl: imageId ? `/images/${imageId}.jpg` : null, });
    } else {
      // If neither a hostel nor restaurant is found in your database, you can query Google Places API to get details
      const placeId = place_id;
      const fields = [
        "name",
        "formatted_address",
        "place_id",
        "geometry",
        "formatted_phone_number",
        "rating",
        "user_ratings_total",
        "photos",
        "types",
      ];
      const fieldString = fields.join(",");
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&fields=${fieldString}&key=${apiKey}`
        );

        if (response.data && response.data.result) {
          const place = response.data.result;
          const {
            name,
            types,
            formatted_address,
            formatted_phone_number,
            rating,
            user_ratings_total,
            photos,
          } = place;

          const category = types.includes('restaurant')
            ? 'Restaurant'
            : types.includes('lodging')
            ? 'Hostel/Hotel'
            : 'Unknown';
          // Calculate the distance (assuming you have lat/lng values)
          // const lat1 = req.body.lat;
          // const lng1 = req.body.lng;
          // const lat2 = place.geometry.location.lat;
          // const lng2 = place.geometry.location.lng;
          const distance = 'Calculating distance...';

          const imageUrl =
            photos && photos.length > 0
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photos[0].photo_reference}&key=${apiKey}`
              : null;

          const finalRating = rating !== undefined ? rating : 0;

          const hostelOrRestaurant = {
            contactNumber: formatted_phone_number || 'Not Given',
            address: formatted_address,
            name,
            imageUrl,
            finalRating,
            totalReviews: user_ratings_total || 0,
            distance,
            category,
          };

          if (category === 'Hostel/Hotel') {
            // Render the details page for hostels/hotels
            res.render('Hostel Details Page', { hostel: hostelOrRestaurant });
          } else {
            // Render the details page for restaurants
            res.render('Restaurant Details Page', { restaurant: hostelOrRestaurant });
          }
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
        res.status(500).send('Internal Server Error');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
};






