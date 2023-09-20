const mongoose = require('mongoose');

const searchResultSchema = new mongoose.Schema({
  query: { type: String, required: true, unique: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  hostels: [
    {
      hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
      distance: { type: Number },
    }
  ],
  restaurants: [{
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    distance: { type: Number }
  }],
  // Add a field to store the document's expiration date (one minute from the creation date)
  createdAt: { type: Date, default: Date.now, index: { expires: 60*60*24*30 } }
});

// Apply indexes to lat and lng fields
searchResultSchema.index({ lat: 1, lng: 1 }, {unique: true});

const SearchResult = mongoose.model('SearchResult', searchResultSchema);

module.exports = SearchResult;

// hostels: [
//   {
//       hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
//       distance: Number
//   }
// ],
// restaurants: [
//     {
//         restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
//         distance: Number
//     }]
