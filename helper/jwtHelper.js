import jwt from "jsonwebtoken";

/**
 * Generate a JWT token.
 * @param {string} id - The user or admin ID to include in the token.
 * @param {string} secretKey - The secret key used for signing the token.
 * @param {string} expiresIn - The expiration time for the token.
 * @returns {Promise<string>} - A promise resolving to the generated JWT token.
 */
const generateToken = async (id, secretKey, expiresIn) => {
  try {
    return jwt.sign({ id }, secretKey, { expiresIn });
  } catch (error) {
    console.error("Error generating token:", error.message);
    throw new Error("Token generation failed");
  }
};

/**
 * Generate a user JWT token.
 * @param {string} id - The user's ID.
 * @returns {Promise<string>} - A promise resolving to the user JWT token.
 */
const generateUserToken = async (id) => {
  if (!process.env.USER_SECRET_KEY) {
    throw new Error("USER_SECRET_KEY is not defined in environment variables.");
  }
  return generateToken(id, process.env.USER_SECRET_KEY, "1h");
};

/**
 * Generate an admin JWT token.
 * @param {string} id - The admin's ID.
 * @returns {Promise<string>} - A promise resolving to the admin JWT token.
 */
const generateAdminToken = async (id) => {
  if (!process.env.ADMIN_SECRET_KEY) {
    throw new Error(
      "ADMIN_SECRET_KEY is not defined in environment variables."
    );
  }
  return generateToken(id, process.env.ADMIN_SECRET_KEY, "5h");
};

/**
 * Generate a random 6-digit verification code.
 * @returns {number} - A 6-digit numeric verification code.
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export { generateUserToken, generateVerificationCode, generateAdminToken };
