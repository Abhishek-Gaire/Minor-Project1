import jwt from "jsonwebtoken";
// Middleware function to extract JWT token from request headers
const extractTokenFromCookie = (req, res, next) => {
    const cookieHeader = req.headers.cookie;
    // console.log(cookieHeader);
    if (cookieHeader) {
      const cookies = cookieHeader.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') {
          req.token = value; // Attach token to the request object
          return next();
        }
      }
    }
    req.token = null;
    return next();
  }
  
  // Middleware function to authenticate user based on JWT token
  const authenticateUser = (req, res, next) => {
    if (req.token) {
      jwt.verify(req.token, 'PROCESS.ENV.SECRET_KEY', (err, decoded) => {
        if (err) {
          return res.sendStatus(401); // Token verification failed, send Unauthorized status
        } else {
          req.user = decoded; // Attach user information to the request object
          return next(); // Proceed to the next middleware/route handler
        }
      });
    } else {
      req.user  = null; // No token provided in this request
      return next(); // Allow access to routes that do not require authentication
    }
  }

  export {extractTokenFromCookie,authenticateUser};

