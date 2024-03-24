const {getSessionId} =require("./sessions");
const sessions ={};
// Function to set flash message
function setFlashMessage(req, type, message) {
  const sessionId = getSessionId(req);
  if (!sessions[sessionId]) {
    sessions[sessionId] = {};
  } 
  sessions[sessionId][type] = message;
}

// Function to retrieve flash message
function getFlashMessage(req, type) {
  const sessionId = getSessionId(req);
  const message = sessions[sessionId] && sessions[sessionId][type];
  delete sessions[sessionId][type]; // Clear flash message after retrieving
  return message;
}

module.exports = { 
    setFlashMessage,
    getFlashMessage
}