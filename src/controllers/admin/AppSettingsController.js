import httpStatus from 'http-status';
import catchAsync from '../../lib/catchAsync.js';
import ApiError from '../../middlewares/ApiError.js';
import { mObj, withTransaction } from '../../lib/mongoose.utils.js';
import resConv from '../../utils/resConv.js';
import AppSettingsDBO from '../../dbos/AppSettingsDBO.js';
import { logg } from '../../utils/logger.js';

class AppSettingsController {
    detail = catchAsync(async (req, res) => await withTransaction(async (session) => {
        const settings = await AppSettingsDBO.getSettings({ session });
        res.status(httpStatus.OK).send(resConv(settings));
    }));

    updateSettings = catchAsync(async (req, res) => await withTransaction(async (session) => {
        logg('updateSettings', req.body);
        const updatedSettings = await AppSettingsDBO.updateSettings(req.body.area, req.body.settings, { session });
        res.status(httpStatus.OK).json(resConv(updatedSettings));
    }))
}


export default new AppSettingsController();
