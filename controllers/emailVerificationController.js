const User = require('./../models/users'); // Assuming you have a User model
const express = require('express');

/**
 * Handle email verification using a verification token.
 * GET /verify-email?token=xxxxxxxx
 */
exports.verifyEmail = async (req, res) => {
  try {
    // Extract the verification token from the query parameters
    const token = req.query.token;

    // Find the user with the given verification token
    const user = await User.findOne({ emailToken: token });

    if (!user) {
      // Invalid token: Redirect with an error message
      req.flash('error', 'Invalid verification token.');
      return res.redirect('/SignIn');
    }

    if (user.isVerified) {
      // User is already verified: Redirect with a message
      req.flash('error', 'Email already verified.');
      return res.redirect('/SignIn');
    }

    // Mark the user as verified and remove the token
    user.isVerified = true;
    user.emailToken = undefined;
    await user.save();

    // Successful verification: Redirect with a success message
    req.flash('success', 'Email verified successfully. You can now log in.');
    res.redirect('/SignIn');
  } catch (error) {
    console.error(error);
    // Internal Server Error: Redirect with a generic error message
    res.status(500).send('Internal Server Error');
  }
};

