import httpStatus from 'http-status';
import catchAsync from '../../lib/catchAsync.js';
import { mObj, withTransaction } from '../../lib/mongoose.utils.js';
import resConv from '../../utils/resConv.js';
import AppSettingsDBO from '../../dbos/AppSettingsDBO.js';
import { logg } from '../../utils/logger.js';
import FileUploadUtils from '../../utils/FileUpload.utils.js';
import Constants from '../../config/constants.js';
import CommonDBO from '../../dbos/CommonDBO.js';

class AppSettingsController {
    uploadImage = catchAsync(async (req, res, next) => {
        const tempUpload = await this.uploadGeneralAssets(req, res);
        const { body, files } = tempUpload;
        const assignFilePath = (field, targetPath, { isArray = false } = {}) => {
            if (!files || !files[field]) return;
            const fileArray = Array.isArray(files[field]) ? files[field] : [files[field]];
            if (fileArray.length === 0) return;
            const filePaths = fileArray.map(file => (file.folderName || Constants.paths.DEFAULT_LOGO_IMAGE_PATH) + file.filename);
            const valueToAssign = isArray ? filePaths : filePaths[0];
            targetPath.split('.').reduce((acc, key, index, arr) => {
                if (index === arr.length - 1) acc[key] = valueToAssign;
                else acc[key] = acc[key] || {};
                return acc[key];
            }, body);
        };
        assignFilePath('favicon', 'settings.general.favicon');
        assignFilePath('logo', 'settings.general.logo');

        req.body = {
            ...req.body,
            ...body,
            // ...files,
        };

        logg('📸 uploadImage → files:', body);
        logg('📦 uploadImage → final req.body:', req.body);

        next();
    });

    detail = catchAsync(async (req, res) => await withTransaction(async (session) => {
        const authenticated = (req.optionalAuth || false) && req.user && req.user.id;
        const settings = await AppSettingsDBO.getSetting({ session });
        if (!authenticated) {
            res.status(httpStatus.OK).send(resConv(AppSettingsDBO.getPublicSettings(settings)));
        }
        res.status(httpStatus.OK).send(resConv(settings));
    }));

    updateSettings = catchAsync(async (req, res) => await withTransaction(async (session) => {
        // logg('updateSettings', req.body);
        const updatedSettings = await AppSettingsDBO.updateSettings(req.body.area, req.body.settings, { session });
        res.status(httpStatus.OK).json(resConv(updatedSettings));
    }))

    getCommonLists = catchAsync(async (req, res) => await withTransaction(async (session) => {
        const { key } = req.body;
        const lists = await CommonDBO.getCommonLists(key, req.body, { session });
        res.status(httpStatus.OK).json(resConv(lists));
    }))


    ////////////////////////// 

    uploadGeneralAssets(req, res) {
        return FileUploadUtils.uploadFiles(
            req,
            res,
            [
                { name: "favicon", maxCount: 1 },
                { name: "logo", maxCount: 1 },
            ],
            {
                favicon: Constants.paths.DEFAULT_LOGO_IMAGE_PATH,
                logo: Constants.paths.DEFAULT_DEFAULT_IMAGE_PATH,
            }
        );
    }
}


export default new AppSettingsController();
