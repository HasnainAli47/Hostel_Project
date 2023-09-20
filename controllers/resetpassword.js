const User = require('../models/users');
const bcrypt = require('bcrypt');
const transporter = require('./email');
const { v4: uuidv4 } = require('uuid');

// Express route to handle "Forgot Password" request
exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: { $regex: new RegExp(email, 'i') } });
  if (!user) {
    req.flash('error', 'Email not registered');
    return res.redirect('/SignIn');
  }

  if (user && user.isVerified !== true) {
    req.flash('error', 'Email not verified');
    return res.redirect('/SignIn');
  }

  // Generate a unique reset token
  const resetToken = uuidv4();
  // Calculate the expiration time
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + 24);

  // Store the reset token and expiration time in the database and retrieve the updated user
  const updatedUser = await User.findOneAndUpdate(
    { email: { $regex: new RegExp(email, 'i') } }, // Filter criteria
    { resetToken, resetTokenExpiresAt: expirationTime }, // Update fields
    { new: true } // Return the updated document
  );

  if (!updatedUser) {
    req.flash('error', 'Email not registered');
    return res.redirect('/SignIn');
  }

  // Send reset email
  const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
  // Color Scheme
  const primaryColor = '#007BFF'; // Primary color for headings and buttons
  const backgroundColor = '#f4f4f4'; // Background color
  const textColor = '#333'; // Text color

  // Button Styles
  const buttonStyles = `
    display: inline-block;
    background-color: ${primaryColor};
    color: #ffffff;
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 5px;
    margin-top: 20px;
  `;

  // Email Template
  const mailOptions = {
    from: process.env.email,
    to: email,
    subject: 'Password Reset',
    html: `
      <html>
      <head>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: ${backgroundColor};
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
              }
              .header {
                  background-color: ${primaryColor};
                  color: #ffffff;
                  text-align: center;
                  padding: 10px 0;
              }
              .content {
                  padding: 20px;
                  color: ${textColor};
              }
              .button {
                  ${buttonStyles}
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Password Reset</h1>
              </div>
              <div class="content">
                  <p>Hello,</p>
                  <p>We received a request to reset your password. Please click the link below to reset your password. This link is valid for the next 24 hours:</p>
                  <p><a class="button" href="${resetLink}">Reset Password</a></p>
                  <p>If you did not request this password reset, please ignore this email. Your account's security is important to us.</p>
                  <p>Do not share this password reset link with anyone for your own security.</p>
                  <p>Thank you for using Luxury Stay. We're here to make your stay exceptional!</p>
                  <p>Best regards,</p>
                  <p>Luxury Stay Team</p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  req.flash('success', 'Please check your email to reset your password');
  res.redirect('/SignIn');
}

// Express route to handle the reset password form
exports.resetPassword = async (req, res) => {
  const { token } = req.query;

  try {
    // Find user by reset token
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      req.flash('error', 'Invalid reset link.');
      return res.redirect('/SignIn');
    }

    // Check if the token has expired
    if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < Date.now()) {
      req.flash('error', 'Expired reset link.');
      return res.redirect('/SignIn');
    }

    const messages = req.flash();

    res.render('reset-password', { token, messages });
  } catch (error) {
    // Handle any database or other errors that may occur during the query
    console.error('Error in resetPassword:', error);
    req.flash('error', 'An error occurred while processing your request.');
    res.redirect('/SignIn');
  }
}

// Express route to handle password reset form submission
exports.resetPasswordPost = async (req, res) => {
  const { token, password, confirmpassword } = req.body;

  // Check if the password is less than 6 characters
  if (password.length < 6) {
    req.flash('error', 'Password length should be greater than or equal to 6 characters.');
    return res.redirect('/reset-password?token=' + token);
  }

  if (password !== confirmpassword) {
    req.flash('error', 'Password and confirm Password do not match.');
    return res.redirect('/reset-password?token=' + token);
  }

  // Find user by reset token and check expiration
  const user = await User.findOne({ resetToken: token });

  if (!user) {
    req.flash('error', 'Invalid reset link.');
    res.redirect('/SignIn');
  }

  // Check if the token has expired
  if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < Date.now()) {
    req.flash('error', 'Expired reset link.');
    res.redirect('/SignIn');
  }

  // Update user's password and clear reset token
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpiresAt = null;
  await user.save();

  req.flash('success', 'Your password has been updated. Please login.');
  res.redirect('/SignIn');
}
