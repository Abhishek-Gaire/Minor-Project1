import jwt from "jsonwebtoken";
// Middleware function to extract JWT token from request headers
const extractAdminTokenFromCookie = (req, res, next) => {
  const cookieHeader = req.headers.cookie;

  if (cookieHeader) {
    const cookies = cookieHeader.split(';');

    for (const cookie of cookies) {
      
      const [name, value] = cookie.trim().split('=');
      
      if (name === 'adminToken') {
        
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

