import axios from 'axios';
import fs from 'fs';
import path from 'path';
import Constants from '../config/constants.js';

class FileDownloadUtils {
    /**
     * Downloads a file from a URL.
     * @param {string} url - The file URL.
     * @param {string} savePath - The directory where the file should be saved.
     * @param {string} fileName - The name to save the file as.
     * @returns {Promise<object>} - Resolves with file data and path (if saved).
     */
    async downloadFile(url, savePath, fileName) {
        try {
            console.log(`📥 Downloading file from: ${url}`);
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream',
            });
            let savedFilePath = null;
            let fileData = [];

            if (savePath) {
                fileName = fileName || url.split('/').pop();
                const memeType = response.headers['content-type'];
                let folderType = '';
                if (memeType.includes('image')) folderType = 'images';
                if (memeType.includes('audio')) folderType = 'audio';
                if (memeType.includes('video')) folderType = 'videos';
                savePath = path.join(savePath, folderType);
                savePath = path.join(Constants.paths.root_public, savePath);

                if (!fs.existsSync(savePath)) {
                    fs.mkdirSync(savePath, { recursive: true });
                }
                savedFilePath = path.join(savePath, fileName);
                const writer = fs.createWriteStream(savedFilePath);
                response.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                console.log(`✅ File saved at: ${savedFilePath}`);
            } else {
                response.data.on('data', chunk => fileData.push(chunk));
                await new Promise(resolve => {
                    response.data.on('end', resolve);
                });

                fileData = Buffer.concat(fileData);
                console.log(`📄 File downloaded but not saved.`);
            }
            return {
                success: true,
                message: savedFilePath ? `File saved at ${savedFilePath}` : 'File downloaded successfully',
                savedPath: savedFilePath,
                fileData: savedFilePath ? null : fileData,
            };
        } catch (error) {
            console.error('❌ File download error:', error.message, error);
            return {
                success: false,
                message: 'Error downloading file',
                error: error.message,
                error,
            };
        }
    }
}

export default new FileDownloadUtils();
