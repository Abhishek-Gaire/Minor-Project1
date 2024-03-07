// Function to extract session ID from cookies
function getSessionId(req) {
    const cookie = req.headers.cookie;
    if (cookie) {
      const match = cookie.match(/sessionId=(\w+)/);
      if (match) {
        return match[1];
      }
    }
    return null;
  }
 // Function to generate a random session ID
 const generateSessionId = () => {
    return Math.random().toString(36).substring(2);
};

module.exports = {
    getSessionId,
    generateSessionId
}