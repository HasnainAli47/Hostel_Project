const Hostel = require("./../models/Hostels");
const Users = require("./../models/users");
const Images = require("./../models/Images");
const searchResult = require("./../models/searchResult");
const geolib = require('geolib');
const multer = require('multer');
const Hotel = require('./../models/Hotel');
// Define storage for uploaded images
const storage = multer.memoryStorage(); // Store uploaded file in memory

// Configure multer upload
const upload = multer({ storage: storage });


async function calculateDistance(lat1, lon1, lat2, lon2) {
  const point1 = { latitude: lat1, longitude: lon1 }; // San Francisco
  const point2 = { latitude: lat2, longitude: lon2 };
  // Calculate the distance between the two points
  const distance = geolib.getDistance(point1, point2);
  return (distance/1000).toFixed(1);
}

exports.getRegister = async (req, res) => {
  
  const isLoggedIn = req.session.user ? true : false;
  const messages = req.flash();
  console.log(isLoggedIn);
  res.render('HotelRegister', { messages, user: req.session.user, isLoggedIn });

}

exports.postRegister = async (req, res) => {
  // res.send(req.body)

  
  
    try {
      const existingHostel = await Hostel.findOne({ place_id: req.body.place_id });
      const User_id = req.session.user._id;
      const loggedInUser = await Users.findOne({ _id: User_id });
      const user_hosId = loggedInUser.hosId;
      if(user_hosId){
        const User_hostel = await Hostel.findById(user_hosId);
        User_hostel.IsRegister = false;
        await User_hostel.save();
      }
  
      if (existingHostel && existingHostel.category == 'Hotel') {
        // Hostel already exists, update its information
        // existingHostel.User_id = loggedInUser._id;
        existingHostel.name = req.body.actualHostelName;
        existingHostel.email = req.body.email;
        existingHostel.address = req.body.actualAddress;
        existingHostel.contactNumber = req.body.Contact;
        existingHostel.lat = req.body.lat;
        existingHostel.lng = req.body.lng;
        existingHostel.category = 'Hotel';
        existingHostel.Stay = req.body.StayDropdown;

        existingHostel.Laundary = req.body.laundryDropdown == 'yes' ? 'Available' : 'Not Available';
        existingHostel.ACHeater = req.body.acHeaterDropdown;
        existingHostel.meetingRoom = req.body.meeetingRoomDropdown == 'yes' ? 'Available' : 'Not Available';
        existingHostel.swimmingPool = req.body.swimmingPoolDropdown == 'yes' ? 'Available' : 'Not Available';
        existingHostel.Restaurant = req.body.restaurantDropdown == 'yes' ? 'Available' : 'Not Available';
        existingHostel.parking= req.body.parkingDropdown == 'yes' ? 'Available' : 'Not Available';
        existingHostel.wifi = req.body.wifiDropdown == 'yes' ? 'Available' : 'Not Available';
        existingHostel.Dining = req.body.diningDropdown;
        existingHostel.Gym = req.body.gymDropdown == 'yes' ? 'Available' : 'Not Available';
        
        
        

        


        
        
        
        existingHostel.IsRegister = true;
        
        const res = await existingHostel.save();
        loggedInUser.isAdmin = true;
        loggedInUser.hosId = res._id;
        await loggedInUser.save();
        
        req.flash('success', 'Hotel is Updated');
      
      } else {
        if(existingHostel){
        var imageID = existingHostel.imageId;
        // If the existing hostel has a different category, remove it and create a new Hotel entry
        await Hostel.findByIdAndDelete(existingHostel._id);
        console.log("Deleted");
        }
        

        

        // Create a new hostel entry
        const newHostel = new Hotel({
        // Hostel already exists, update its information
        // User_id : loggedInUser._id,
        place_id : req.body.place_id,
        name : req.body.actualHostelName,
        email: req.body.email,
        address : req.body.actualAddress,
        contactNumber : req.body.Contact,
        lat : req.body.lat,
        lng : req.body.lng,
        imageId: imageID || null,
        category : 'Hotel',
        Laundary : req.body.laundryDropdown ? req.body.laundryDropdown : 'Not Available',
        ACHeater : req.body.acHeaterDropdown,
        wifi: req.body.wifiDropdown == 'yes' ? 'Available' : 'Not Available',
        parking : req.body.parkingDropdown == 'yes' ? 'Available' : 'Not Available',
        Stay: req.body.StayDropdown == 'yes' ? 'Available' : 'Not Available',
        meetingRoom : req.body.meeetingRoomDropdown == 'yes' ? 'Available' : 'Not Available',
        swimmingPool : req.body.swimmingPoolDropdown == 'yes' ? 'Available' : 'Not Available',
        Restaurant : req.body.restaurantDropdown == 'yes' ? 'Available' : 'Not Available',
        Dining : req.body.diningDropdown,
        Gym : req.body.gymDropdown == 'yes' ? 'Available' : 'Not Available',

        finalRating: req.body.rating != null ? req.body.rating : 0,
        totalReviews: req.body.TotalRating != null ? req.body.TotalRating : 0,
        
        IsRegister : true,
        });

        
        
        const savedHostel = await newHostel.save();
        console.log("Saved", savedHostel);



        const searchResults = await searchResult.find({}); // Fetch all search results (you might want to add conditions if needed)

        const nearbySearchResults = [];

        for (const searchResult of searchResults) {
          const distance = await calculateDistance(newHostel.lat, newHostel.lng, searchResult.lat, searchResult.lng);
          console.log(distance);

          if (distance <= 10) {
            nearbySearchResults.push(searchResult);
          }
        }

        // Update nearby searchResults' hostels array
        for (const nearbyResult of nearbySearchResults) {
          nearbyResult.hostels.push({
            hostel: savedHostel._id,
            distance: await calculateDistance(newHostel.lat, newHostel.lng, nearbyResult.lat, nearbyResult.lng),
          });

          await nearbyResult.save();
        }




        loggedInUser.isAdmin = true;
        loggedInUser.hosId = savedHostel._id;
        await loggedInUser.save();
        
        req.flash('success', 'Hotel Created');
      }
      req.session.user = loggedInUser;
      res.redirect('/')
    } catch (error) {
      console.error('Error processing form data:', error);
      res.status(500).send('An error occurred while processing the form data.');
    }
  };

// exports.getManagePropertyPage = async (req, res) => {
//   const hosId = req.session.user.hosId;
//   try {
//     const hostel = await Hostel.findById(hosId);
//     // Now you can render the page or do other operations with the hostel data
//     const isLoggedIn = req.session.user ? true : false;
//     const messages = req.flash();
//     res.render('HostelRegister', { messages, user: req.session.user, isLoggedIn, hostel });
//   } catch (error) {
//     console.error('Error fetching hostel:', error);
//     // Handle the error
//   }
// }

exports.deleteproperty = async (req, res) => {
  const hosId = req.session.user.hosId;
  const userId = req.session.user._id;
  const hostel = await Hostel.findById(hosId);
  const user = await Users.findById(userId);
  user.isAdmin = false;
  user.hosId = null;
  const Updated_User = await user.save();
  if(hostel){
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
  }
  else{
    req.flash('error', 'Register a Hostel First');
    res.redirect('/')
  }
  
}
