const transporter = require('./email');

// Function to render the Contact Us page
exports.getContactUs = async (req, res) => {
  const user = req.session.user;
  const messages = req.flash();
  res.render('Contact', { user, messages });
};

// Function to handle form submission for the Contact Us page
exports.postContactUs = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Create the email data
  const mailOptions = {
    from: email, // Sender's email address
    to: process.env.official, // Admin's email address (correct the environment variable name)
    subject: subject,
    html: `
      <html>
        <head>
          <style>
            /* Define styles here */
            body {
              font-family: Arial, sans-serif;
              background-color: #f0f0f0;
            }
            h1 {
              color: #333;
            }
            p {
              color: #555;
              font-size: 16px;
            }
            strong {
              color: #222;
            }
          </style>
        </head>
        <body>
          <h1>Contact Form Submission</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="border: 1px solid #ccc; padding: 10px;">${message}</p>
        </body>
      </html>
    `,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    req.flash('success', 'Message sent successfully.');
    res.redirect('/Contact'); // Redirect to a thank-you page or back to the contact page
  } catch (error) {
    console.error('Error sending email:', error);
    req.flash('error', 'An error occurred while sending the message.');
    res.redirect('/Contact'); // Redirect with an error message
  }
};
