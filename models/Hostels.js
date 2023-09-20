const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  User_id: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  place_id: { type: String, required: true, unique: true, index: true },
  name: String,
  email: String,
  contactNumber: String,
  category: String,
  address: String,
  Rent: {type:Number, default : 0},
  mess: {type:String, default : "Yet Not Registered"},
  messRent: {type:Number, default : 0},
  messMenuImageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
  Laundary: {type:String, default : "Yet Not Registered"},
  ACHeater: {type:String, default : "Yet Not Registered"},
  wifi: {type:String, default : "Yet Not Registered"},
  Kitchen: {type:String, default : "Yet Not Registered"},
  Lockers: {type:String, default : "Yet Not Registered"},
  parking: {type:String, default : "Yet Not Registered"},
  finalRating: Number,
  totalReviews: Number,
  imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
  lat: {type: Number, required: true},
  lng: {type: Number, required: true},
  IsRegister: {type:Boolean, default : false},
});

// Apply indexes to lat and lng fields
hostelSchema.index({ lat: 1, lng: 1 });

const Hostel = mongoose.model('Hostel', hostelSchema);

module.exports = Hostel;
