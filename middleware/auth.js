import jwt from "jsonwebtoken";
// Middleware function to extract JWT token from request headers
const extractTokenFromCookie = (req, res, next) => {
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
      if (name === 'token') {
        // console.log("Token is null")
        req.token = value;
        return next(); 
      }
    }
  }
  req.token = null;
  next();
}
  
  // Middleware function to authenticate user based on JWT token
const authenticateUser = (req, res, next) => {
  // console.log("In Middleware",req.token);

  if(req.token){
    try {
      const decoded = jwt.verify(req.token, process.env.SECRET_KEY);
      req.user = decoded; // User has been successfully verified and added to the request object
      next(); // Move to the next middleware or route handler
    } catch (error) {
      console.log(error);
      res.writeHead(401);
      res.end("No Access");
    }
    
  }else{
    req.user = null;
    return next();
  }
}

export {extractTokenFromCookie,authenticateUser};

