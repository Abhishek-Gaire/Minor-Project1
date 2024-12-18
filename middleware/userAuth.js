import jwt from "jsonwebtoken";

// Helper function to parse cookies
const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        cookies[name] = value;
      }
    });
  }
  return cookies;
};

// Middleware to extract JWT token from cookies
const extractTokenFromCookie = (req, res, next) => {
  try {
    const cookieHeader = req.headers.cookie;
    const cookies = parseCookies(cookieHeader);
    req.token = cookies.userToken || null; // Set token or null if not found
  } catch (error) {
    console.error("Error parsing cookies:", error);
    req.token = null;
  }
  next(); // Proceed to the next middleware
};

// Middleware to authenticate user based on JWT token
const authenticateUser = (req, res, next) => {
  if (!req.token) {
    req.user = null;
    return next(); // Proceed if no token is present
  }

  try {
    // Validate secret key presence
    const secretKey = process.env.USER_SECRET_KEY;
    if (!secretKey) {
      console.error("USER_SECRET_KEY is not defined in environment variables.");
      res.writeHead(500, { "Content-Type": "text/plain" });
      return res.end("Internal Server Error");
    }

    // Verify and decode the token
    const decoded = jwt.verify(req.token, secretKey);
    req.user = decoded; // Attach decoded user data to request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Unauthorized Access");
  }
};

export { extractTokenFromCookie, authenticateUser };
