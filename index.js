const express = require('express');
const mongoose = require('mongoose');
const app = express();
const flash = require('connect-flash');
const session = require('express-session');
require('dotenv').config(); // Load environment variables
const User = require('./models/users');

// Load security middleware
const securityMiddleware = require('./middlewares/securityMiddleware');

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*'); // Handle CORS here if needed
//   next();
// });

// Access environment variables using `process.env`
const secretKey = process.env.SECRET_KEY;
const databaseUrl = process.env.DATABASE_URL;

// Connect to MongoDB
mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies
app.use(express.static('public')); // Serve static files from the 'public' directory

// Apply security middleware
app.use(securityMiddleware.setSecurityHeaders);
app.use(securityMiddleware.xssProtection);

// Set a secret key for sessions
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 360000000, // Set an appropriate session timeout value
  }
}));

// Flash message
app.use(flash());

// Set up Pug as the view engine
app.set('view engine', 'pug');
app.set('views', 'views');

// Load routers
const mainRouter = require('./routes/main');
app.use('/', mainRouter);

// Error handling middleware (for future use)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
