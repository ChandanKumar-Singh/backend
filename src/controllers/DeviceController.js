import httpStatus from "http-status";
import DeviceDBO from "../dbos/DeviceDBO.js";
import catchAsync from "../lib/catchAsync.js";
import ApiError from "../middlewares/ApiError.js";
import resConv from "../utils/resConv.js";
import { withTransaction } from "../lib/mongoose.utils.js";

class DeviceController {

    registerDevice = catchAsync(async (req, res) => withTransaction(async (session) => {
        const deviceData = req.body;
        const device = await DeviceDBO.assignDeviceToUser(req.user.id, deviceData, { session });
        res.status(httpStatus.OK).json(resConv(device, "Device registered successfully"));
    }
    ));

    getUserDevices = catchAsync(async (req, res) => {
        const { userId } = req.params;
        const devices = await DeviceDBO.getDevicesByUserId(userId, { session: null });
        if (!devices || devices.length === 0) {
            throw new ApiError(httpStatus.NOT_FOUND, "No devices found for this user");
        }
        res.status(httpStatus.OK).json(resConv(devices));
    });


    deleteDevice = catchAsync(async (req, res) => {
        const { deviceId } = req.params;
        const deleted = await DeviceDBO.deleteUserDevice(req.user.id, deviceId);
        if (!deleted) {
            throw new ApiError(httpStatus.NOT_FOUND, "Device not found");
        }
        res.status(httpStatus.OK).json(resConv({}, "Device removed successfully!"));
    });

}


export default new DeviceController();
