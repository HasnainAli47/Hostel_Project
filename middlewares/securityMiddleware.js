// middleware/securityMiddleware.js

const xss = require('xss');
const csrf = require('csurf');

// XSS Protection - Sanitize user input to prevent XSS attacks
exports.xssProtection = (req, res, next) => {
  for (const key in req.body) {
    if (Object.hasOwnProperty.call(req.body, key)) {
      req.body[key] = xss(req.body[key]);
    }
  }
  next();
};

// CSRF Protection - Generate and validate CSRF tokens
const csrfProtection = csrf({ cookie: true });

exports.csrfProtection = csrfProtection;

// Set Security Headers - Add security-related HTTP headers
exports.setSecurityHeaders = (req, res, next) => {
  // Add various security headers to enhance security
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Strict Transport Security (HSTS) - Enable HTTPS enforcement
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy (CSP) can be added here as well to prevent inline scripts and other security risks
  
  next();
};
