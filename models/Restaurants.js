const mongoose = require('mongoose');
const Image = require('./Images'); // Import the Image schema

const restaurantSchema = new mongoose.Schema({
  name: String,
  place_id: {type:String, required: true, unique: true, index: true},
  email: String,
  category: String,
  address: String,
  contactNumber: String,
  finalRating: Number,
  totalReviews: Number,
  imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
  lat: {type: Number, required: true},
  lng: {type: Number, required: true},
  familyHall: {type:String, default : "Yet Not Registered"},
  fastfood: {type:String, default : "Yet Not Registered"},
  ACHeater: {type:String, default : "Yet Not Registered"},
  wifi: {type:String, default : "Yet Not Registered"},
  parking: {type:String, default : "Yet Not Registered"},
  outdoorSeating: {type:String, default : "Yet Not Registered"},
  beverages: {type: String, default : "Yet Not Registered"},
  Dining: {type: String, default : "Yet Not Registered"},
  PrivateParties: {type: String, default : "Yet Not Registered"},

  IsRegister: {type:Boolean, default : false},
}
);

// Apply indexes to lat and lng fields
restaurantSchema.index({ lat: 1, lng: 1 });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
