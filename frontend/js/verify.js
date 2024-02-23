// Get all the digit input fields
const digitInputs = document.querySelectorAll('.inputs input[type="number"]');

// Add event listener to each input field
digitInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        // If the current field has a value, focus on the next field
        if (input.value.length === 1 && index < digitInputs.length - 1) {
            digitInputs[index + 1].focus();
        }
    });
    input.addEventListener('keydown', (event) => {
        // If backspace is pressed and the field is empty, focus on the previous field
        if (event.key === 'Backspace' && input.value.length === 0 && index > 0) {
            digitInputs[index - 1].focus();
        }
    });
});