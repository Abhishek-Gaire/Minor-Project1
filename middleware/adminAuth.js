import jwt from "jsonwebtoken";

// Helper function to parse cookies from the cookie header
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

// Middleware to extract admin JWT token from cookies
const extractAdminTokenFromCookie = (req, res, next) => {
  try {
    const cookieHeader = req.headers.cookie;
    const cookies = parseCookies(cookieHeader);
    req.adminToken = cookies.adminToken || null; // Set adminToken or null if not found
  } catch (error) {
    console.error("Error parsing admin cookies:", error);
    req.adminToken = null; // Ensure token is null if an error occurs
  }
  next(); // Proceed to the next middleware
};

// Middleware to authenticate admin based on the JWT token
const authenticateAdmin = (req, res, next) => {
  if (!req.adminToken) {
    req.admin = null; // No token, continue without authentication
    return next();
  }

  try {
    // Validate the presence of ADMIN_SECRET_KEY
    const secretKey = process.env.ADMIN_SECRET_KEY;
    if (!secretKey) {
      console.error(
        "ADMIN_SECRET_KEY is not defined in environment variables."
      );
      res.writeHead(500, { "Content-Type": "text/plain" });
      return res.end("Internal Server Error");
    }

    // Verify and decode the admin token
    const decoded = jwt.verify(req.adminToken, secretKey);
    req.admin = decoded; // Attach decoded admin data to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("JWT verification failed for admin:", error.message);
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Unauthorized Access");
  }
};

export { extractAdminTokenFromCookie, authenticateAdmin };
