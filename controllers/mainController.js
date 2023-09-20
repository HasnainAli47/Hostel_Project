const User = require('../models/users');
const bcrypt = require('bcrypt');
const transporter = require('./email');
const { v4: uuidv4 } = require('uuid');

const { Mutex } = require('async-mutex');
// Create a mutex instance
const mutex = new Mutex();

exports.getMainPage = async (req, res, next) => {
  try {
    const isLoggedIn = req.session.user ? true : false;
    const messages = req.flash();
    res.render('MainPage', { messages, user: req.session.user, isLoggedIn });
  } catch (err) {
    next(err);
  }
};

// Get the SignUp Page
exports.getSignUpPage = (req, res) => {
  res.render('SignUp', { messages: req.flash() });
};

// Save a user in the database / Post User
exports.postSignUp = async (req, res) => {
  try {
    const { name, email, password, confirmpassword } = req.body;

    // Custom validations
    const errors = [];
    if (name.trim().length < 3) {
      req.flash('error', 'Name must have at least 3 characters.');
      return res.redirect('/SignUp');
    }
    if (password.trim().length < 6) {
      req.flash('error', 'Password must have at least 6 characters.');
      return res.redirect('/SignUp');
    }
    if (password !== confirmpassword) {
      req.flash('error', 'Password and confirm Password do not match.');
      return res.redirect('/SignUp');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      req.flash('error', 'Invalid email format.');
      return res.redirect('/SignUp');
    }

    









  // Inside your route handler
  const release = await mutex.acquire();
  try{


      // Check if the user already exists in the database
  const existingUser = await User.findOne({ email: { $regex: new RegExp(email, 'i') } });

  if (existingUser) {
    if (!existingUser.isVerified) {
      // Generate a new UUID token for verification
      const emailToken = {
        token: uuidv4(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Token expires in 24 hours
      };

      // Update the user's emailToken field with the new token and expiration
      existingUser.emailToken = emailToken.token;
      existingUser.emailTokenExpiresAt = emailToken.expiresAt;
      await existingUser.save();

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

      // Send the email with the new verification link
      const mailOptions = {
        from: 'alihasnain.031350.pk@gmail.com',
        to: email,
        subject: 'Email Verification',
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
                      <h1>Email Verification</h1>
                  </div>
                  <div class="content">
                      <p>Hello ${name},</p>
                      <p>Welcome to Luxury Stay! To get started, please verify your email address by clicking the link below. This link is valid for the next 24 hours:</p>
                      <p><a class="button" href="${process.env.BASE_URL}/verify-email?token=${emailToken.token}">Verify Email</a></p>
                      <p>If you didn't create an account on Luxury Stay, you can safely ignore this email.</p>
                      <p>Thank you for choosing Luxury Stay. We're here to make your stay unforgettable!</p>
                      <p>Best regards,</p>
                      <p>Luxury Stay Team</p>
                  </div>
              </div>
          </body>
          </html>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);

        req.flash('success', 'A new verification email has been sent. Please check your email to verify your account.');

        // Redirect to the sign-up page or another appropriate page
        return res.redirect('/SignIn');
      } catch (error) {
        console.error('Error sending verification email:', error);
        req.flash('error', 'An error occurred while sending the verification email.');
        return res.redirect('/SignIn'); // Redirect with an error message
      }
    } else {
      // User is already verified
      req.flash('error', 'Email already registered and verified');
      return res.redirect('/SignUp'); // Redirect back to the SignUp page
    }
    }}finally{
      release();
    }

// If the code reaches here, it means the user does not exist
// Continue with creating a new user and sending the initial verification email
// ... (rest of your code for creating a new user and sending the initial email)















    // Generate a UUID token
    const emailToken = {
      token: uuidv4(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Token expires in 24 hours
    };

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
      from: 'alihasnain.031350.pk@gmail.com',
      to: email,
      subject: 'Email Verification',
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
                    <h1>Email Verification</h1>
                </div>
                <div class="content">
                    <p>Hello ${name},</p>
                    <p>Welcome to Luxury Stay! To get started, please verify your email address by clicking the link below. This link is valid for the next 24 hours:</p>
                    <p><a class="button" href="${process.env.BASE_URL}/verify-email?token=${emailToken.token}">Verify Email</a></p>
                    <p>If you didn't create an account on Luxury Stay, you can safely ignore this email.</p>
                    <p>Thank you for choosing Luxury Stay. We're here to make your stay unforgettable!</p>
                    <p>Best regards,</p>
                    <p>Luxury Stay Team</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);

      // Update user's emailToken field and save the user
      // ...

      // Redirect or respond accordingly
      // ...
    } catch (error) {
      // Handle error
      console.log(error);
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user and save it to the database
    const newUser = new User({ name, email, password: hashedPassword, emailToken: emailToken.token });
    await newUser.save();

    req.flash('success', 'Please check your email to verify your account');

    // Schedule a task to delete unverified users after a certain time
    scheduleDeleteUnverifiedUser(emailToken.token, emailToken.expiresAt);

    // Redirect to the home page after successful sign-up
    res.redirect('/SignIn');
  } catch (error) {
    console.error('Error in user registration:', error);
    req.flash('error', 'An error occurred while registering the user.');
    res.redirect('/SignUp'); // Redirect with an error message
  }
};

// Function to schedule the deletion of unverified user after a certain time
function scheduleDeleteUnverifiedUser(token, expiresAt) {
  const now = Date.now();
  const timeUntilExpiration = expiresAt - now;

  if (timeUntilExpiration > 0) {
    setTimeout(async () => {
      try {
        // Delete the user based on the token
        const deletedUser = await User.findOneAndDelete({ emailToken: token });
        if (deletedUser) {
          console.log(`Deleted unverified user with token: ${token}`);
        }
      } catch (error) {
        console.error('Error deleting unverified user:', error);
      }
    }, timeUntilExpiration);
  }
}
