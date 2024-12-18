import { formidable } from "formidable";

// Utility to delete a cookie
function deleteCookie(res, cookieName, options = {}) {
  const cookieParts = [`${cookieName}=; Max-Age=0`];

  // Add optional attributes like Path, Domain, or Secure
  if (options.path) cookieParts.push(`Path=${options.path}`);
  if (options.domain) cookieParts.push(`Domain=${options.domain}`);
  if (options.secure) cookieParts.push("Secure");
  if (options.httpOnly) cookieParts.push("HttpOnly");

  res.setHeader("Set-Cookie", cookieParts.join("; "));
}

// Utility to parse form data including file uploads
const parseFormDataWithImage = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({});

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Error parsing form data:", err.message);
        reject(new Error("Failed to parse form data. Please try again."));
      } else {
        resolve({ fields, files });
      }
    });
  });
};

// Utility to get the current date in MM-DD-YYYY format
const getDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, "0"); // Corrected to get the day of the month
  return `${month}-${day}-${year}`;
};

export { deleteCookie, parseFormDataWithImage, getDate };
