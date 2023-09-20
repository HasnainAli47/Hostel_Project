const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mainController = require('../controllers/mainController');
const authController = require('../controllers/authController');
const searchController = require('../controllers/searchController');
const deatilsController = require('../controllers/detailsController');
const imageController = require('../controllers/imagesController');
const HostelRegisterController = require('../controllers/hostelRegisterController');
const RestaurnatRegisterController = require('../controllers/RestaurantRegisterController');
const emailVerificationController = require('./../controllers/emailVerificationController')
const resetPassword = require('./../controllers/resetpassword')
const contact = require('./../controllers/contactUs')

// Create multer storage and upload configurations
const storage = multer.memoryStorage(); // Store uploaded file in memory as a buffer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit (adjust as needed)
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png']; // Allow only JPEG and PNG files (adjust as needed)
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'));
    }
  },
});

// Load security middleware
const securityMiddleware = require('../middlewares/securityMiddleware');

// Route to render the SignUp page
router.get('/SignUp', mainController.getSignUpPage);

// Route to handle form submission
router.post('/SignUp', mainController.postSignUp);

// Route to render the SignIn page
router.get('/SignIn', authController.getSignIn);

// Route to handle form submission for SignIn
router.post('/SignIn', authController.postSignIn);

// Route to handle SignOut
router.get('/SignOut', authController.getSignOut);

// Route to handle the Details Page
router.get('/Search/Details/:details', deatilsController.getDetails);

// Route to handle the search query
router.get('/Search/:searchQuery', searchController.getSearch);

// Route to render the Search page
router.get('/Search', searchController.getSearchPage);

// Contact Us Page
router.get('/Contact', contact.getContactUs);
router.post('/Contact', contact.postContactUs);

// Route to handle email verification link
router.get('/verify-email', emailVerificationController.verifyEmail);

// Route to handle the forget password
router.post('/forget-password', resetPassword.forgetPassword);

// Route to render the reset password page
router.get('/reset-password', resetPassword.resetPassword);

// Route to handle form submission for reset password
router.post('/reset-password', resetPassword.resetPasswordPost);

// Router to render the Hostel Register Page
router.get('/HostelRegister', authController.isAuthenticated, HostelRegisterController.getRegister);
router.post("/HostelRegister", authController.isAuthenticated, upload.single('hostelImage'), HostelRegisterController.postRegister);
router.get('/deleteHostel', authController.isAuthenticated, HostelRegisterController.deleteproperty);

// Router to render the Restaurant Register Page
router.get('/RestaurantRegister', authController.isAuthenticated, RestaurnatRegisterController.getRegister);
router.post("/RestaurantRegister", authController.isAuthenticated, upload.single('hostelImage'), RestaurnatRegisterController.postRegister);
router.get('/deleteRestaurant', authController.isAuthenticated, RestaurnatRegisterController.deleteproperty);

// Create a route to manage property
router.get('/ManageProperty', authController.isAuthenticated, RestaurnatRegisterController.getManagePropertyPage);

// Create a route to serve images
router.get('/images/:imageId.jpg', imageController.getImage);

router.get('/api/google-maps-api-key', (req, res) => {
  res.json({ googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// Define the main route
router.get('/', mainController.getMainPage);

// Catch-all route to redirect to the main page when no route matches
router.get('*', (req, res) => {
  res.redirect('/');
});

module.exports = router;
