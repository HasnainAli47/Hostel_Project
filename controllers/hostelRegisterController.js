const Hostel = require("./../models/Hostels");
const Users = require("./../models/users");
const Images = require("./../models/Images");
const searchResult = require("./../models/searchResult");
const geolib = require('geolib');
const multer = require('multer');
const sharp = require('sharp');

// Define storage for uploaded images
const storage = multer.memoryStorage(); // Store uploaded file in memory

// Configure multer upload
const upload = multer({ storage: storage });

/**
 * Calculate the distance between two sets of latitude and longitude coordinates.
 * @param {number} lat1 - Latitude of the first location.
 * @param {number} lon1 - Longitude of the first location.
 * @param {number} lat2 - Latitude of the second location.
 * @param {number} lon2 - Longitude of the second location.
 * @returns {number} - Distance between the two locations in kilometers.
 */
async function calculateDistance(lat1, lon1, lat2, lon2) {
  const point1 = { latitude: lat1, longitude: lon1 };
  const point2 = { latitude: lat2, longitude: lon2 };
  const distance = geolib.getDistance(point1, point2);
  return (distance / 1000).toFixed(1);
}

/**
 * Process and convert an image.
 * @param {Buffer} imageBuffer - Image data as a buffer.
 * @returns {Promise<Buffer>} - Processed image data as a buffer.
 */
async function processAndConvertImage(imageBuffer) {
  const processedImageBuffer = await sharp(imageBuffer)
    .resize(800) // Adjust image processing as needed
    .toBuffer();
  return processedImageBuffer;
}

/**
 * Render the Hostel Registration page.
 * GET /HostelRegister
 */
exports.getRegister = async (req, res) => {
  const isLoggedIn = req.session.user ? true : false;
  const messages = req.flash();
  console.log(isLoggedIn);
  res.render('HostelRegister', { messages, user: req.session.user, isLoggedIn });
};

/**
 * Handle the Hostel Registration form submission.
 * POST /HostelRegister
 */
exports.postRegister = async (req, res) => {
  try {
    // Check if the Hostel with the same place_id exists
    const existingHostel = await Hostel.findOne({ place_id: req.body.place_id });

    // Get the logged-in user's ID
    const User_id = req.session.user._id;

    // Find the logged-in user
    const loggedInUser = await Users.findOne({ _id: User_id });

    // Get the logged-in user's hostel ID (if exists)
    const user_hosId = loggedInUser.hosId;

    // Check the user is owner of the hostel or not
    if (existingHostel !== null && existingHostel.IsRegister !== undefined) {
      if(existingHostel.IsRegister === true){
      if (user_hosId === undefined) {
        req.flash('error', 'Hostel is already registered');
        return res.redirect('/');
      }
    else if(user_hosId && !user_hosId.equals(existingHostel._id)){
       req.flash('error', 'Hostel is already registered');
          return res.redirect('/');
        }
      }
    }
    

    if (existingHostel) {
      // Hostel already exists, update its information
      console.log("Updating");

      existingHostel.name = req.body.actualHostelName;
        existingHostel.email = req.body.email;
        existingHostel.address = req.body.actualAddress;
        existingHostel.contactNumber = req.body.Contact;
        existingHostel.lat = req.body.lat;
        existingHostel.lng = req.body.lng;
        existingHostel.category = 'Hostel';
        existingHostel.Rent = req.body.hostelRent;
        existingHostel.mess = req.body.messDropdown == 'yes' ? 'Available' : 'Not Available'
        existingHostel.messRent = req.body.messDropdown == 'yes' ? req.body.messPrice : 0;
        existingHostel.Laundary = req.body.laundryDropdown ? req.body.laundryDropdown : 'Not Available';
        existingHostel.ACHeater = req.body.acHeaterDropdown;
        existingHostel.wifi = req.body.wifiDropdown == 'yes' ? 'Available' : 'Not Available';
        existingHostel.Kitchen = req.body.kitchenDropdown == 'yes' ? 'Available' : 'Not Available';
        existingHostel.parking = req.body.parkingDropdown == 'yes' ? 'Available' : 'Not Available';
        existingHostel.Lockers = req.body.lockerDropdown == 'yes' ? 'Available' : 'Not Available';
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
        await existingHostel.save();
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
      existingHostel.IsRegister = true;
      loggedInUser.isAdmin = true;
      loggedInUser.hosId = res._id;
      await loggedInUser.save();

      req.flash('success', 'Hostel is Updated');
    } else {
      // Hostel doesn't exist, create a new entry

      // Create a new hostel entry
      const newHostel = new Hostel({
        // Populate hostels fields here
        place_id : req.body.place_id,
        name : req.body.actualHostelName,
        email: req.body.email,
        address : req.body.actualAddress,
        contactNumber : req.body.Contact,
        lat : req.body.lat,
        lng : req.body.lng,
        category : 'Hostel',
        Rent : req.body.hostelRent,
        mess : req.body.messDropdown == 'yes' ? 'Available' : 'Not Available',
        messRent : req.body.messPrice ? req.body.messPrice : 0,
        Laundary : req.body.laundryDropdown ? req.body.laundryDropdown : 'Not Available',
        ACHeater : req.body.acHeaterDropdown,
        wifi: req.body.wifiDropdown == 'yes' ? 'Available' : 'Not Available',
        Kitchen : req.body.kitchenDropdown == 'yes' ? 'Available' : 'Not Available',
        parking : req.body.parkingDropdown == 'yes' ? 'Available' : 'Not Available',
        Lockers : req.body.lockerDropdown == 'yes' ? 'Available' : 'Not Available',

        finalRating: req.body.rating != null ? req.body.rating : 0,
        totalReviews: req.body.TotalRating != null ? req.body.TotalRating : 0,
        // imageId : savedImage._id,

        IsRegister: true,
      });

      
      // Save the new hostel entry
      const savedHostel = await newHostel.save();

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
        const distance = await calculateDistance(newHostel.lat, newHostel.lng, searchResult.lat, searchResult.lng);

        if (distance <= 10) {
          nearbySearchResults.push(searchResult);
        }
      }

      // Add the new hostel to the nearby search results
      for (const nearbyResult of nearbySearchResults) {
        nearbyResult.hostels.push({
          hostel: savedHostel._id,
          distance: await calculateDistance(newHostel.lat, newHostel.lng, nearbyResult.lat, nearbyResult.lng),
        });

        await nearbyResult.save();
      }

      // Update the logged-in user's information
      loggedInUser.isAdmin = true;
      loggedInUser.hosId = savedHostel._id;
      await loggedInUser.save();

      req.flash('success', 'Hostel Created');
    }

    req.session.user = loggedInUser;
    res.redirect('/');
  } catch (error) {
    console.error('Error processing form data:', error);
    res.status(500).send('An error occurred while processing the form data.');
  }
};

/**
 * Delete a hostel property.
 * GET /deleteHostel
 */
exports.deleteproperty = async (req, res) => {
  const hosId = req.session.user.hosId;
  const userId = req.session.user._id;
  const hostel = await Hostel.findById(hosId);
  const user = await Users.findById(userId);
  user.isAdmin = false;
  user.hosId = null;
  const Updated_User = await user.save();
  if (hostel) {
    try {
      await searchResult.updateMany({}, { $pull: { "hostels": { hostel: hosId } } });
      await Images.findByIdAndDelete(hostel.imageId);
      await searchResult.updateMany({}, { $pull: { hostels: hosId } });
      await Hostel.findByIdAndDelete(hosId);
      req.flash('success', 'Property deleted successfully');
      req.session.user = Updated_User;
      res.redirect('/');
    } catch (error) {
      console.log("Error in deleting property");
    }
  } else {
    req.flash('error', 'Register a Hostel First');
    res.redirect('/')
  }
};
