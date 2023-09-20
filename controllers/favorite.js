const Users = require('./../models/users');
const Restaurant = require('./../models/Restaurants');
const Hostel = require('./../models/Hostels');


exports.postFavorite = async (req, res) => {
    const itemId = req.params.id; // Hostel or Restaurant ID
    const userId = req.session.user._id;
  
    try {
      const user = await Users.findById(userId);
  
      if (user) {
        // Check if the item is already in user's favorites
        const isFavorite = user.favoriteItems.includes(itemId);
  
        if (isFavorite) {
          // Remove item from user's favorites
          user.favoriteItems.pull(itemId);
        } else {
          // Add item to user's favorites
          user.favoriteItems.push(itemId);
        }
  
        await user.save();
        res.redirect('/Favorite'); // Redirect to a suitable page after adding/removing favorite
      } else {
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding/removing favorite');
    }
  };


  exports.getFavorite = async (req, res) => {
    const userId = req.session.user._id;
  
    try {
      const user = await Users.findById(userId)
      .populate('populatedHostels',  'name place_id address finalRating totalReviews imageId')
      .populate('populatedRestaurants', 'name place_id address finalRating totalReviews imageId');

    if (user) {
      // Combine favoriteHostels and favoriteRestaurants into a single array
      const favoriteItems = [];

      // Process favoriteHostels
      user.populatedHostels.forEach(hostel => {
        console.log("hostel", hostel);
        const { _id, name, place_id, address, finalRating, totalReviews, imageId } = hostel;
        const imageUrl = imageId ? `/images/${imageId}.jpg` : null;

        favoriteItems.push({
          _id,
          type: 'Hostel',
          name,
          address,
          finalRating,
          totalReviews,
          imageUrl,
          place_id
        });
      });


      // Process favoriteRestaurants
      user.populatedRestaurants.forEach(restaurant => {
        const { _id, place_id, name, address, finalRating, totalReviews, imageId } = restaurant;
        const imageUrl = imageId ? `/images/${imageId}.jpg` : null;

        favoriteItems.push({
          _id,
          type: 'Restaurant',
          name,
          address,
          finalRating,
          totalReviews,
          imageUrl,
          place_id
        });
      });

      const isLoggedIn = req.session.user ? true : false;
      const messages = req.flash();

      res.render('FavoriteList', { user, messages, isLoggedIn,  favoriteItems });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving favorite list');
  }
};


exports.deleteFavorite = async (req, res) => {
  const userId = req.session.user._id;
  const itemId = req.params.id;
  try {
    const user = await Users.findById(userId);

    if (user) {
      // Check if the item is already in user's favorites
      const isFavorite = user.favoriteItems.includes(itemId);
      
      if (isFavorite) {
        // Remove item from user's favorites
        user.favoriteItems.pull(itemId);
        await user.save();
        res.redirect('/FavoriteList'); // Redirect to a suitable page after adding/removing favorite
      } else {
        res.status(404).send('Item not found');
      }
    } else {
      res.status(404).send('User not found');
    }
  }catch (error) {
    console.error(error);
    res.status(500).send('Error deleting favorite');
  }
}