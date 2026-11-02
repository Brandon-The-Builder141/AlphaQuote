/**
 * Authentication Middleware
 * Verifies JWT tokens from Clerk and extracts user information.
 *
 * Pass Two (lockdown): the previous demo-mode fallback — which authenticated
 * ANY caller as a built-in demo user whenever token verification failed and
 * the request carried an `x-demo-mode: true` header — has been removed
 * completely. There is no header-based, fallback, or demo authentication of
 * any kind: a request either carries a valid Clerk token or it gets a 401.
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
    // Verification failed for any reason. No fallback authentication exists.
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

module.exports = {
  authenticateUser
};
