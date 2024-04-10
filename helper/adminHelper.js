import {formidable}  from "formidable";

// Function to delete a cookie
function deleteCookie(res, cookieName) {
    res.setHeader('Set-Cookie', [`${cookieName}=; Max-Age=0`]);
}

const parseFormDataWithImage = async(req) => {
    return new Promise((resolve, reject) => {
      const form = formidable({});
  
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    });
};

const getDate = () => {
    const year = new Date(Date.now()).getFullYear();
    const month = new Date(Date.now()).getMonth();
    const day = new Date(Date.now()).getDay();
    return `${month}-${day}-${year}`;
}

export{deleteCookie, parseFormDataWithImage, getDate};