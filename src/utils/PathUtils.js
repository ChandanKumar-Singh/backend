import { fileURLToPath } from 'url';
import path from 'path';
import Constants from '../config/constants.js';
export const filename = fileURLToPath(import.meta.url);
export const dirname = path.dirname(filename);

export const assetPath = (filePath) => {
    return URL(`${Constants.paths.public_url}${filePath}`);
}