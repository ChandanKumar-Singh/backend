import multer from "multer";
import path from "path";
import fs from "fs";
import Constants from "../config/constants.js";
import { removeWildCards } from "./UrlsUtils.js";
import { errorLog, logg } from "./logger.js";

class FileUpload {
  uploadFiles = async (req, res, fields, fieldFolderMap) => {
    // logg("[FileUpload] 📂 Uploading files...", req.body, fields, fieldFolderMap);
    const Storage = multer.diskStorage({
      destination: function (req, file, callback) {
        const folderName = !fieldFolderMap ? Constants.paths.DEFAULT_DEFAULT_IMAGE_PATH :
          typeof fieldFolderMap === "string" ? fieldFolderMap :
            typeof fieldFolderMap === "object" && file.fieldname in fieldFolderMap ?
              fieldFolderMap[file.fieldname] :
              Constants.paths.DEFAULT_DEFAULT_IMAGE_PATH;
        const uploadFolder = path.join(Constants.paths.root_public, folderName);

        if (!fs.existsSync(uploadFolder)) {
          fs.mkdirSync(uploadFolder, { recursive: true });
        }
        file.folderName = folderName;
        callback(null, uploadFolder);
      },
      filename: function (req, file, callback) {
        callback(null, Date.now() + "_" + removeWildCards(file.originalname));
      },
    });

    // Define file filter to allow only specific extensions
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];

    const fileFilter = (allowed) => (req, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) {
        callback(null, true);
      } else {
        const tempErr =  `Invalid file type! Only ${allowed.join(", ")} files are allowed.`
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
          const tempErr = new Error(err);
          reject(err);
        }

        resolve(req);
      });
    });

    return await uploadFilePromise;
  };

  /**
   * Deletes all uploaded files from request if an error occurs.
   * @param {Object} files - The files object from multer.
   */
  deleteUploadedFiles = (files) => {
    if (!files || Object.keys(files).length === 0) return;
    try {
      Object.values(files).forEach(fileArray => {
        fileArray.forEach(file => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`Deleted: ${file.path}`);
          }
        });
      });
    } catch (error) {
      console.error("Error deleting files:", error);
    }
  };


  deleteFiles = async (files, reason) => {
    if (!files || files.length === 0) return;
    errorLog("Deleting files: ", files, reason);
    try {
      files.forEach(file => {
        const filePath = path.join(Constants.paths.root_public, file);
        if (path && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      );
    }
    catch (error) {
      console.error("Error deleting files:", error);
    }
  }
}

export default new FileUpload();
