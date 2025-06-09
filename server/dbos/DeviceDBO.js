import Constants from "../config/constants.js";
import { mObj, mongoOne } from "../lib/mongoose.utils.js";
import DeviceInfo from "../models/core/DeviceInfo.js";
import UserModel from "../models/UserModel.js";
import DateUtils from "../utils/DateUtils.js";

class DeviceDBO {

    async query({
        query = [],
        midQuery = [],
        project = {},
        timezone = Constants.TIME_ZONE_NAME,
        session = null,
        paginate = false,
        page = 1,
        limit = 20,
        sortBy = "lastActiveAt",
        sortOrder = -1,
    } = {}) {
        try {
            const skip = (page - 1) * limit;

            const pipeline = [
                ...query,
                ...midQuery,
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        createdAtText: DateUtils.aggregate("$createdAt", { timezone }),
                        updatedAtText: DateUtils.aggregate("$updatedAt", { timezone }),
                        lastActiveAtText: DateUtils.aggregate("$lastActiveAt", { timezone }),
                    },
                },
            ];

            // Add sorting, pagination, and projection
            pipeline.push(
                { $sort: { [sortBy]: sortOrder } }, // Sorting
                { $skip: skip }, // Pagination - Skip items
                { $limit: limit }, // Pagination - Limit items
                {
                    $project: {
                        userId: 1,
                        deviceId: 1,
                        fingerprint: 1,
                        deviceType: 1,
                        os: 1,
                        osVersion: 1,
                        appVersion: 1,
                        screenSize: 1,
                        ipAddress: 1,
                        location: 1,
                        isActive: 1,
                        lastActiveAt: 1,
                        fcmToken: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        createdAtText: 1,
                        updatedAtText: 1,
                        lastActiveAtText: 1,
                        user: {
                            _id: 1,
                            email: 1,
                            fullName: 1,
                            phone: 1,
                            profileImage: 1,
                            role: 1,
                            status: 1,
                            isActive: 1,
                            is_flagged: 1,
                        },
                        ...project,
                    },
                }
            );

            // Run aggregation
            const devices = await DeviceInfo.aggregate(pipeline).session(session);
            if (!paginate) return devices;

            // Fetch total count separately for pagination metadata
            const total = await DeviceInfo.countDocuments(query).session(session);

            return {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                devices,
            };

        } catch (error) {
            console.error('Error in DeviceDBO -> query:', error);
            throw error;
        }
    }

    getDeviceById = async (deviceId, { session }) => {
        return mongoOne(await this.query({ query: [{ $match: { deviceId: mObj(deviceId) } }], session }));
    }

    getDevicesByUserId = async (userId, { session = null }) => {
        return await this.query({ query: [{ $match: { userId: mObj(userId) } }], paginate: true, session });
    }

    assignDeviceToUser = async (userId, data, { session }) => {
        let device = await DeviceInfo.findOne({ deviceId: data.deviceId }).session(session);
        if (!device) device = new DeviceInfo({ userId });
        if (data.deviceId) device.deviceId = data.deviceId;
        if (data.fingerprint) device.fingerprint = data.fingerprint;
        if (data.deviceType) device.deviceType = data.deviceType;
        if (data.os) device.os = data.os;
        if (data.osVersion) device.osVersion = data.osVersion;
        if (data.appVersion) device.appVersion = data.appVersion;
        if (data.screenSize) device.screenSize = data.screenSize;
        if (data.ipAddress) device.ipAddress = data.ipAddress;
        if (data.location?.lat && data.location?.lon) device.location = { lat: data.location.lat, lon: data.location.lon };
        if (data.isActive) device.isActive = data.isActive;
        if (data.fcmToken) device.fcmToken = data.fcmToken;
        device = await device.save({ session, new: true, upsert: true });
        const user = await UserModel.findById(mObj(userId)).session(session);
        user.deviceId = device._id;
        user.fcmToken = device.fcmToken;
        await user.save({ session });
        return mongoOne(await this.query({ query: [{ $match: { deviceId: device.deviceId } }], session }));
    }

    deleteUserDevice = async (userId, deviceId, { session }) => {
        await DeviceInfo.updateOne({ userId, deviceId }, { isActive: false }, { session, new: true });
        return await this.getDeviceById(deviceId, { session });
    }

}

export default new DeviceDBO();