const Restaurant = require("./../models/Restaurants");
const Hostel = require("./../models/Hostels");
const Users = require("./../models/users");
const Images = require("./../models/Images");
const searchResult = require("./../models/searchResult");
const geolib = require('geolib');
const multer = require('multer');
const sharp = require('sharp')

// Define storage for uploaded images
const storage = multer.memoryStorage(); // Store uploaded file in memory

// Configure multer upload
const upload = multer({ storage: storage });

// Function to calculate distance between two coordinates
async function calculateDistance(lat1, lon1, lat2, lon2) {
  const point1 = { latitude: lat1, longitude: lon1 };
  const point2 = { latitude: lat2, longitude: lon2 };
  const distance = geolib.getDistance(point1, point2);
  return (distance / 1000).toFixed(1); // Distance in kilometers, rounded to 1 decimal place
}

// Function to process and convert images
async function processAndConvertImage(imageBuffer) {
  // Process the image using the sharp library
  const processedImageBuffer = await sharp(imageBuffer)
    .resize(800) // Adjust image processing as needed
    .toBuffer();

  return processedImageBuffer;
}

// Controller for rendering the Restaurant registration page
exports.getRegister = async (req, res) => {
  const isLoggedIn = req.session.user ? true : false;
  const messages = req.flash();
  res.render('RestaurantRegister', { messages, user: req.session.user, isLoggedIn });
}

// Controller for handling Restaurant registration form submission
exports.postRegister = async (req, res) => {
  try {
    // Check if the restaurant with the same place_id exists
    const existingHostel = await Restaurant.findOne({ place_id: req.body.place_id });
    // Get the logged-in user's ID
    const User_id = req.session.user._id;

    // Find the logged-in user
    const loggedInUser = await Users.findOne({ _id: User_id });

    // Get the logged-in user's hostel ID (if exists)
    const user_hosId = loggedInUser.resId;

    // Check the user is owner of the restaurant or not
    if (existingHostel !== null && existingHostel.IsRegister !== undefined) {
      if(existingHostel.IsRegister === true){
      if (user_hosId == undefined) {
        req.flash('error', 'Restaurant is already registered');
        return res.redirect('/');
      }
    else if(user_hosId && !user_hosId.equals(existingHostel._id)){
          req.flash('error', 'Restaurant is already registered');
          return res.redirect('/');
        }
      }
    }

    if (existingHostel) {
      // Hostel already exists, update its information

      existingHostel.name = req.body.actualHostelName;
      existingHostel.address = req.body.actualAddress;
      existingHostel.contactNumber = req.body.Contact;
      existingHostel.email = req.body.email;
      existingHostel.lat = req.body.lat;
      existingHostel.lng = req.body.lng;
      existingHostel.category = 'Restaurant';
      existingHostel.familyHall = req.body.familyDropdown == 'yes' ? 'Available' : 'Not Available';
      existingHostel.fastfood = req.body.fastfoodDropdown == 'yes' ? 'Available' : 'Not Available';
      existingHostel.ACHeater = req.body.acHeaterDropdown;
      existingHostel.wifi = req.body.wifiDropdown == 'yes' ? 'Available' : 'Not Available';
      existingHostel.parking = req.body.parkingDropdown == 'yes' ? 'Available' : 'Not Available';
      existingHostel.outdoorSeating = req.body.outdoorSeatingDropdown == 'yes' ? 'Available' : 'Not Available';
      existingHostel.beverages = req.body.beveragesDropdown == 'yes' ? 'Available' : 'Not Available';
      existingHostel.Dining = req.body.diningDropdown;
      existingHostel.PrivateParties = req.body.privatePartiesDropdown == 'yes' ? 'Available' : 'Not Available';
      existingHostel.IsRegister = true;

      if (req.file) {
        const processedImageBuffer = await processAndConvertImage(req.file.buffer);

        if (existingHostel.imageId) {
          await Images.findByIdAndDelete(existingHostel.imageId);
        }

        const hostelImage = new Images({
          image: { data: processedImageBuffer, contentType: 'image/jpeg' },
        });
        const savedImage = await hostelImage.save();

        existingHostel.imageId = savedImage._id;
      }

      // Update the IsRegister status
      existingHostel.IsRegister = true;
      const res = await existingHostel.save();

      // If the user had a previous hostel, mark it as not registered
      if(user_hosId){
        if (!user_hosId.equals(res._id)) {
          const User_hostel = await Hostel.findById(user_hosId);
          User_hostel.IsRegister = false;
          await User_hostel.save();
        }
      }

      // Update the logged-in user's information
      loggedInUser.isAdmin = true;
      // loggedInUser.resId = existingHostel._id;
      loggedInUser.resId = res._id;
      await loggedInUser.save();

      req.flash('success', 'Restaurant is Updated');
    } else {
      // Restaurant doesn't exist, create a new entry

      // Create a new restaurant entry
      const newRestaurant = new Restaurant({
        // Populate restaurant fields here
        place_id: req.body.place_id,
        name: req.body.actualHostelName,
        address: req.body.actualAddress,
        contactNumber: req.body.Contact,
        email: req.body.email,
        lat: req.body.lat,
        lng: req.body.lng,
        category: 'Restaurant',
        ACHeater: req.body.acHeaterDropdown,
        finalRating: req.body.rating != null ? req.body.rating : 0,
        totalReviews: req.body.TotalRating != null ? req.body.TotalRating : 0,
        familyHall: req.body.familyDropdown == 'yes' ? 'Available' : 'Not Available',
        fastfood: req.body.fastfoodDropdown,
        wifi: req.body.wifiDropdown == 'yes' ? 'Available' : 'Not Available',
        parking: req.body.parkingDropdown == 'yes' ? 'Available' : 'Not Available',
        outdoorSeating: req.body.outdoorSeatingDropdown == 'yes' ? 'Available' : 'Not Available',
        beverages: req.body.beveragesDropdown == 'yes' ? 'Available' : 'Not Available',
        Dining: req.body.diningDropdown,
        PrivateParties: req.body.privatePartiesDropdown == 'yes' ? 'Available' : 'Not Available',
        // imageId: savedImage._id,
        IsRegister: true,
      });

      // Save the new hostel entry
      const savedHostel = await newRestaurant.save();

      // Process and save the image
      if (req.file) {
        console.log("Req file");
        const processedImageBuffer = await processAndConvertImage(req.file.buffer);
        const hostelImage = new Images({
          image: { data: processedImageBuffer, contentType: 'image/jpeg' },
        });

        const savedImage = await hostelImage.save();
        savedHostel.imageId = savedImage._id;
        await savedHostel.save();
      }

      const searchResults = await searchResult.find({});

      const nearbySearchResults = [];

      // Add the new hostel to the search results with facilty of 10km near search
      for (const searchResult of searchResults) {
        const distance = await calculateDistance(newRestaurant.lat, newRestaurant.lng, searchResult.lat, searchResult.lng);

        if (distance <= 10) {
          nearbySearchResults.push(searchResult);
        }
      }

      // Add the new hostel to the nearby search results
      for (const nearbyResult of nearbySearchResults) {
        nearbyResult.restaurants.push({
          restaurant: savedHostel._id,
          distance: await calculateDistance(newRestaurant.lat, newRestaurant.lng, nearbyResult.lat, nearbyResult.lng),
        });

        await nearbyResult.save();
      }

      // Update the logged-in user's information
      loggedInUser.isAdmin = true;
      loggedInUser.resId = savedHostel._id;
      await loggedInUser.save();

      req.flash('success', 'Restaurant Created');
    }

    // Update the session with the logged-in user's information
    req.session.user = loggedInUser;
    res.redirect('/');
  } catch (error) {
    console.error('Error processing form data:', error);
    res.status(500).send('An error occurred while processing the form data.');
  }
};

// Controller for rendering the property management page
exports.getManagePropertyPage = async (req, res) => {
  let hosId = req.session.user.hosId;
  let resId = req.session.user.resId;

  try {
    const restaurant = await Restaurant.findById(resId);
    const hostel = await Hostel.findById(hosId);

    if (restaurant) {
      console.log("Restaurant", restaurant);
      const isLoggedIn = req.session.user ? true : false;
      const messages = req.flash();
      res.render('RestaurantRegister', { messages, user: req.session.user, isLoggedIn, restaurant });
    } else if (hostel && hostel.IsRegister == true && hostel.category == 'Hostel') {
      console.log("Hostel", hostel);
      const isLoggedIn = req.session.user ? true : false;
      const messages = req.flash();
      res.render('HostelRegister', { messages, user: req.session.user, isLoggedIn, hostel });
    }
  } catch (error) {
    console.error('Error fetching property:', error);
  }
}

// Controller for deleting a property
exports.deleteproperty = async (req, res) => {
  const resId = req.session.user.resId;
  const userId = req.session.user._id;
  const restaurant = await Restaurant.findById(resId);
  const user = await Users.findById(userId);
  user.isAdmin = false;
  user.hosId = null;
  const updatedUser = await user.save();

  console.log(restaurant);

  if (restaurant) {
    try {
      await searchResult.updateMany({}, { $pull: { "restaurants": { restaurant: resId } } });
        await Images.findByIdAndDelete(restaurant.imageId);
      await Restaurant.findByIdAndDelete(resId);

      req.flash('success', 'Property deleted successfully');
      req.session.user = updatedUser;
      res.redirect('/');
    } catch (error) {
      console.log("Error in deleting property");
    }
  } else {
    req.flash('error', 'Register a Restaurant First');
    res.redirect('/')
  }
}
