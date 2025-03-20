import crypto from "crypto";
import { isMongoId } from "../lib/mongoose.utils.js";

const algorithm = "aes-256-cbc";
const secretKey = Buffer.from("your-32-character-long-secret-key!");
const iv = Buffer.from("your-16-char-iv!");

export const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, "utf-8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};

export const decrypt = (encryptedText) => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
};

export const decryptId = (encryptedId) => {
    try {
        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
        let decrypted = decipher.update(encryptedId, "hex", "utf-8");
        decrypted += decipher.final("utf-8");

        return isMongoId(decrypted) ? decrypted : null; // Ensure it's a valid MongoDB ID after decryption
    } catch (error) {
        return null; // Return null if decryption fails
    }
};
export const decryptRequestIds = (req, res, next) => {
    const processData = (data) => {
        for (const key in data) {
            if (typeof data[key] === "string" && !isMongoId(data[key])) {
                const decryptedValue = decryptId(data[key]);
                if (decryptedValue) {
                    data[key] = decryptedValue;
                }
            } else if (typeof data[key] === "object" && data[key] !== null) {
                processData(data[key]);
            }
        }
    };

    // Process params, query, and body
    processData(req.params);
    processData(req.query);
    processData(req.body);

    next();
};
