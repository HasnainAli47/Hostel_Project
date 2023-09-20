const Images = require('./../models/Images');
const path = require('path'); // Make sure to include the 'path' module

/**
 * Get and serve an image by its ID.
 * GET /images/:imageId.jpg
 */
exports.getImage = async (req, res) => {
  const imageId = req.params.imageId;
  try {
    const image = await Images.findById(imageId);
    if (!image) {
      // If the image doesn't exist, you can return a placeholder image or an error message
      return res.status(404).sendFile(path.join(__dirname, 'public', 'placeholder.jpg'));
    }
    
    // Set the response content type to JPEG
    res.set('Content-Type', 'image/jpeg');
    // Send the image data
    res.send(image.image.data);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).send('Error serving image');
  }
};
