import mongoose from 'mongoose';
import UserModel from '../models/UserModel.js'; // Adjust as needed
import Constants from '../config/constants.js';
import DateUtils from '../utils/DateUtils.js';
import { mObj, mongoOne } from '../lib/mongoose.utils.js';
import ApiError from '../middlewares/ApiError.js';
import { logg } from '../utils/logger.js';

class UserDBO {
    constructor() {
    }

    /**
     * Fetch users with deep aggregation and flexible filters.
     * @param {Array} query - Initial query filters (e.g., match conditions)
     * @param {Array} midQuery - Additional query filters (e.g., date range, access control)
     * @param {Object} project - Fields to include/exclude in response
     * @returns {Promise<Array>} - Returns formatted user data
     */
    async fetchUsers(query = [], midQuery = [], project = {}, timezone = Constants.TIME_ZONE_NAME) {
        try {
            const users = await UserModel.aggregate([
                ...query,
                ...midQuery,

                // Lookup Roles
                {
                    $lookup: {
                        from: 'roles',
                        localField: 'role_ids',
                        foreignField: '_id',
                        as: 'roles',
                    },
                },

                // Lookup Address
                {
                    $lookup: {
                        from: 'addresses',
                        localField: 'address_id',
                        foreignField: '_id',
                        as: 'addressObj',
                    },
                },
                { $unwind: { path: '$addressObj', preserveNullAndEmptyArrays: true } },

                // Lookup Company
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'company_id',
                        foreignField: '_id',
                        as: 'companyObj',
                    },
                },
                { $unwind: { path: '$companyObj', preserveNullAndEmptyArrays: true } },

                // Lookup Preferences
                {
                    $lookup: {
                        from: 'preferences',
                        localField: '_id',
                        foreignField: 'user_id',
                        as: 'preferences',
                    },
                },

                // Computed Fields
                {
                    $addFields: {
                        fullName: { $concat: ['$firstName', ' ', '$lastName'] },
                        ageGroup: {
                            $switch: {
                                branches: [
                                    { case: { $lt: ['$age', 18] }, then: 'Minor' },
                                    { case: { $lt: ['$age', 40] }, then: 'Adult' },
                                    { case: { $gte: ['$age', 40] }, then: 'Senior' },
                                ],
                                default: 'Unknown',
                            },
                        },
                        isActive: { $eq: ['$status', 'active'] },
                        approvedOnText: DateUtils.aggregate("$approved_on", { timezone: timezone }),
                        createdAtText: DateUtils.aggregate("$createdAt", { timezone: timezone }),
                        updatedAtText: DateUtils.aggregate("$updatedAt", { timezone: timezone }),
                        is_flagged: false,
                    },
                },

                // Final Projection
                {
                    $project: {
                        id: '$_id',
                        firstName: 1,
                        lastName: 1,
                        fullName: 1,
                        email: 1,
                        contact: 1,
                        profilePicture: {
                            $concat: [
                                Constants.path.public_url,
                                { $ifNull: ['$profilePicture', Constants.path.DEFAULT_USER_IMAGE] },
                            ],
                        },
                        age: 1,
                        ageGroup: 1,
                        gender: 1,

                        // Address Object
                        address: {
                            street: '$addressObj.street',
                            city: '$addressObj.city',
                            state: '$addressObj.state',
                            zip: '$addressObj.zip',
                        },

                        // Company Object
                        company: {
                            name: '$companyObj.name',
                            code: '$companyObj.code',
                            industry: '$companyObj.industry',
                        },

                        // Role Array
                        roles: {
                            $map: {
                                input: '$roles',
                                as: 'role',
                                in: {
                                    id: '$$role._id',
                                    name: '$$role.name',
                                    permissions: '$$role.permissions',
                                },
                            },
                        },

                        // Preferences Array
                        preferences: {
                            $map: {
                                input: '$preferences',
                                as: 'preference',
                                in: {
                                    key: '$$preference.key',
                                    value: '$$preference.value',
                                },
                            },
                        },

                        status: 1,
                        isActive: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        approvedOnText: 1,
                        createdAtText: 1,
                        updatedAtText: 1,

                        ...project, // Extend projection dynamically
                    },
                },
            ]);
            return users;
            return users.map((user) => ({
                ...user,
                createdAtText: DateUtils.changeTimezoneFromUtc(user.createdAt, timezone, Constants.DATE_TIME_FORMAT),
                updatedAtText: DateUtils.changeTimezoneFromUtc(user.updatedAt, timezone, Constants.DATE_TIME_FORMAT),
            }));
        } catch (error) {
            throw error;
        }
    }

    getAllAdmins = async (q) => {
        return await this.fetchUsers([{ $match: { type: Constants.roles.userRoles.ADMIN } }]);
    }

    getById = async (id, shouldForce = false) => {
        // const redisKey = Constants.REDIS_KEY.USER_DETAIL;
        // const redisData = await RedisUtils.hmGetRedis(redisKey, id);
        // if (redisData && Constants.IS_REDIS_STORE && !shouldForce) {
        //   return JSON.parse(redisData);
        // } else {
        // throw new ApiError(403, 'Method not implemented.');

        const obj = mongoOne(
            await this.fetchUsers([{ $match: { _id: mObj(id) } }])
        );
        //   if (obj) {
        //     RedisUtils.setHMSetRedis(redisKey, {
        //       [obj.id.toString()]: JSON.stringify(obj),
        //     });
        return obj;
        //   }
        //   return null;
        // }
    };
}

export default new UserDBO();
