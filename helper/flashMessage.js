// Store flash messages globally
const flashMessages = {};

// Function to set flash messages
const setFlashMessage= async(type, message)=> {
    flashMessages[type] = message;
}

// Function to get and clear flash messages
const getFlashMessage = async(type) =>{
    const message = flashMessages[type];
    delete flashMessages[type];
    return message;
}

export {setFlashMessage,getFlashMessage};
