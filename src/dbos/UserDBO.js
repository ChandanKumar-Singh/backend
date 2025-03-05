import UserModel from '../models/UserModel.js'; // Adjust as needed
import Constants from '../config/constants.js';
import DateUtils from '../utils/DateUtils.js';
import { mObj, mongoOne } from '../lib/mongoose.utils.js';
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
    async fetchUsers({
        query = [],
        midQuery = [],
        project = {},
        timezone = Constants.TIME_ZONE_NAME,
        session = null,
        paginate = false,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = -1,
    } = {}) {
        try {
            const skip = (page - 1) * limit;

            const pipeline = [
                ...query,
                ...midQuery,
                {
                    $lookup: {
                        from: 'roles',
                        localField: 'role_ids',
                        foreignField: '_id',
                        as: 'roles',
                    },
                },
                {
                    $lookup: {
                        from: 'addresses',
                        localField: 'address_id',
                        foreignField: '_id',
                        as: 'addressObj',
                    },
                },
                { $unwind: { path: '$addressObj', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'company_id',
                        foreignField: '_id',
                        as: 'companyObj',
                    },
                },
                { $unwind: { path: '$companyObj', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'preferences',
                        localField: '_id',
                        foreignField: 'user_id',
                        as: 'preferences',
                    },
                },
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
                        approvedOnText: DateUtils.aggregate("$approved_on", { timezone }),
                        createdAtText: DateUtils.aggregate("$createdAt", { timezone }),
                        updatedAtText: DateUtils.aggregate("$updatedAt", { timezone }),
                        is_flagged: false,
                    },
                }
            ];

            // If only count is needed, return total count
            /* if (count) {
                pipeline.push({ $count: "totalCount" });
                const result = await UserModel.aggregate(pipeline).session(session);
                return result.length > 0 ? result[0].totalCount : 0;
            } */

            // Add sorting, pagination, and projection
            pipeline.push(
                { $sort: { [sortBy]: sortOrder } }, // Sorting
                { $skip: skip }, // Pagination - Skip items
                { $limit: limit }, // Pagination - Limit items
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
                }
            );

            // Run aggregation
            const users = await UserModel.aggregate(pipeline).session(session);
            if (!paginate)
                return users;


            // Fetch total count separately for pagination metadata
            const total = await UserModel.countDocuments(query).session(session);

            return {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                users,
            };

        } catch (error) {
            console.error("fetchUsers Error:", error);
            throw error;
        }
    }


    getAllAdmins = async (q) => {
        return await this.fetchUsers({ query: [{ $match: { type: Constants.roles.userRoles.ADMIN } }], paginate: true, limit: 20 });
    }

    getById = async (id, { session = null, shouldForce = false } = {}) => {
        // const redisKey = Constants.REDIS_KEY.USER_DETAIL;
        // const redisData = await RedisUtils.hmGetRedis(redisKey, id);
        // if (redisData && Constants.IS_REDIS_STORE && !shouldForce) {
        //   return JSON.parse(redisData);
        // } else {
        // throw new ApiError(403, 'Method not implemented.');

        const obj = mongoOne(
            await this.fetchUsers({ query: [{ $match: { _id: mObj(id) } }], session })
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
