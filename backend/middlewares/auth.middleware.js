const jwt = require('jsonwebtoken');

/*
 * Strict auth: rejects the request with 401 unless a valid token cookie is
 * present. Use on routes that mutate state or expose private data.
 */
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    console.log('Auth middleware error: ', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      return res.status(401).json({ message: 'Authentication failed' });
    }
  }
};

/*
 * Lenient auth: decodes the token and attaches `req.user` if one is valid, but
 * allows unauthenticated requests through untouched. Used by public-but-aware
 * routes like fetching another user's profile, where knowing *who* is viewing
 * lets us compute flags like `isFollowing` without gating the whole endpoint.
 */
const attachUserIfAuth = (req, _res, next) => {
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
  } catch {
    // Swallow invalid/expired tokens silently — the caller doesn't require auth.
    // `req.user` simply stays undefined.
  }
  next();
};

module.exports = { verifyAuth, attachUserIfAuth };
