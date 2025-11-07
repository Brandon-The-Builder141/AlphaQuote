/**
 * Authentication Middleware
 * Verifies JWT tokens from Clerk and extracts user information
 */

const { verifyToken } = require('@clerk/clerk-sdk-node');

const authenticateUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Clerk
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    // Add user information to request object
    req.user = {
      id: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      metadata: payload.public_metadata || {}
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Handle demo mode
    if (req.headers['x-demo-mode'] === 'true') {
      req.user = {
        id: 'demo-user',
        email: 'demo@alphaquote.com',
        firstName: 'Demo',
        lastName: 'User',
        isDemo: true,
        metadata: {
          profileCompleted: true,
          companyName: 'Demo Construction Co.'
        }
      };
      return next();
    }

    return res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    req.user = {
      id: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      metadata: payload.public_metadata || {}
    };

    next();
  } catch (error) {
    // Token invalid, continue without authentication
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateUser,
  optionalAuth
};
