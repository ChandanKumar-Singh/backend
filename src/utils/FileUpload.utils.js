import multer from "multer";
import path from "path";
import Constants from "../config/constants.js";
import { removeWildCards } from "./UrlsUtils.js";

class FileUpload {
  uploadFiles = async (req, res, fields, folderName) => {
    const Storage = multer.diskStorage({
      destination: function (req, file, callback) {
        callback(null, path.resolve(Constants.path.root) + "/public/" + folderName);
      },
      filename: function (req, file, callback) {
        callback(null, Date.now() + "_" + removeWildCards(file.originalname));
      },
    });

    // Define file filter to allow only specific extensions
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];

    const fileFilter = (allowed) => (req, file, callback) => {
      // Fallback to allowedExtensions if 'allowed' is undefined or null
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) {
        callback(null, true); // Accept file
      } else {
        const tempErr = new Error(
          "Invalid file type! Only .jpg, .jpeg, .png, and .gif files are allowed."
        );
        tempErr.status = 400;
        callback(tempErr, false); 
      }
    };

    const upload = multer({
      storage: Storage,
      fileFilter: fileFilter(allowedExtensions),
    }).fields(fields);

    const uploadFilePromise = new Promise((resolve, reject) => {
      upload(req, res, function (err) {
        if (err) {
          const tempErr = new Error(
            "something happened while uploading file: " + err
          );
          tempErr.status = 500;
          reject(tempErr);
        }

        resolve(req);
      });
    });

    return await uploadFilePromise;
  };
}

export default new FileUpload();
