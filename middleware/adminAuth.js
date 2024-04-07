import jwt from "jsonwebtoken";
// Middleware function to extract JWT token from request headers
const extractAdminTokenFromCookie = (req, res, next) => {
  const cookieHeader = req.headers.cookie;
  // console.log("Cookie Header",cookieHeader);
  if (cookieHeader) {
    const cookies = cookieHeader.split(';');
    // console.log(cookies);
    for (const cookie of cookies) {
      // console.log(cookie);
      // console.log("Inside for loop")
      const [name, value] = cookie.trim().split('=');
      // console.log(name,value);
      // console.log(value);
      if (name === 'adminToken') {
        // console.log("Token is null")
        req.adminToken = value;
        return next(); 
      }
    }
  }
  req.adminToken = null;
  next();
}
  
  // Middleware function to authenticate user based on JWT token
const authenticateAdmin = (req, res, next) => {
  // console.log("In Middleware",req.token);

  if(req.adminToken){
    try {
      const decoded = jwt.verify(req.adminToken, process.env.ADMIN_SECRET_KEY);
      req.admin = decoded; // User has been successfully verified and added to the request object
      next(); // Move to the next middleware or route handler
    } catch (error) {
      console.log(error);
      res.writeHead(401);
      res.end("No Access");
    }
    
  }else{
    req.admin = null;
    return next();
  }
}

export {extractAdminTokenFromCookie,authenticateAdmin};

