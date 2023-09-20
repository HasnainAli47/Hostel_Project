const User = require('../models/users');
const bcrypt = require('bcrypt');

// Function to render the login page
exports.getSignIn = (req, res) => {
  res.render('SignIn', { messages: req.flash() });
};

// Function to process the login form submission
exports.postSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user in the database by email
    const user = await User.findOne({ email: { $regex: new RegExp(email, 'i') } });
    if (!user) {
      req.flash('error', 'Email or password is incorrect');
      return res.redirect('/SignIn');
    }

    // Check if the provided password matches the user's password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      req.flash('error', 'Email or password is incorrect');
      return res.redirect('/SignIn');
    }

    if (!user.isVerified) {
      req.flash('error', 'Email is not verified');
      return res.redirect('/SignIn');
    }

    // In a real application, implement a secure authentication strategy here.
    // You can use third-party libraries like Passport.js or implement your custom logic.
    // For this example, we'll use a simple session-based authentication:

    // Store the user object in the session to keep the user authenticated
    req.session.user = user;

    req.flash('success', 'User logged in successfully');
    res.redirect('/');
  } catch (error) {
    console.error('Error in postSignIn:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Handle SignOut
exports.getSignOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/SignIn');
  });
};

// Middleware to check if the user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next(); // User is authenticated, proceed to the next middleware or route
  } else {
    req.flash('error', 'You must be logged in to access this page');
    res.redirect('/SignIn'); // User is not authenticated, redirect to the login page
  }
};
