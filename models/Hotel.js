const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  User_id: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  place_id: { type: String, required: true, unique: true, index: true },
  name: String,
  email: String,
  contactNumber: String,
  category: String,
  address: String,
  Stay: {type:String, default : "Yet Not Registered"},
  Laundary: {type:String, default : "Yet Not Registered"},
  ACHeater: {type:String, default : "Yet Not Registered"},
  parking: {type:String, default : "Yet Not Registered"},
  meetingRoom: {type:String, default : "Yet Not Registered"},
  swimmingPool: {type:String, default : "Yet Not Registered"},
  wifi: {type:String, default : "Yet Not Registered"},
  Restaurnat: {type:String, default : "Yet Not Registered"},
  Dining: {type:String, default : "Yet Not Registered"},
  Gym: {type:String, default : "Yet Not Registered"},
  finalRating: Number,
  totalReviews: Number,
  imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
  lat: {type: Number, required: true},
  lng: {type: Number, required: true},
  IsRegister: {type:Boolean, default : false},
});

// Apply indexes to lat and lng fields
hotelSchema.index({ lat: 1, lng: 1 });

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
