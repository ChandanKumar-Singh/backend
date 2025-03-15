import Constants from "../config/constants.js";
import WebPage from "../models/WebPage.js";
import DateUtils from "../utils/DateUtils.js";
import { mObj, mongoOne } from "../lib/mongoose.utils.js";
import ApiError from "../middlewares/ApiError.js";
import ResponseCodes from "../config/ResponseCodes.js";
import { logg } from "../utils/logger.js";

class WebPageDBO {
    query = async ({
        query = [],
        midQuery = [],
        project = {},
        timezone = Constants.TIME_ZONE_NAME,
        session = null,
        paginate = false,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = -1,
    } = {}) => {
        try {
            const skip = (page - 1) * limit;

            const pipeline = [
                ...query,
                ...midQuery,
                {
                    $lookup: {
                        from: "users",
                        localField: "createdBy",
                        foreignField: "_id",
                        as: "createdByUser",
                    },
                },
                { $unwind: { path: "$createdByUser", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        localField: "updatedBy",
                        foreignField: "_id",
                        as: "updatedByUser",
                    },
                },
                { $unwind: { path: "$updatedByUser", preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        createdAtText: DateUtils.aggregate("$createdAt", { timezone }),
                        updatedAtText: DateUtils.aggregate("$updatedAt", { timezone }),
                        createdBy: {
                            id: "$createdByUser._id",
                            name: "$createdByUser.name",
                            email: "$createdByUser.email",
                            profilePicture: {
                                $concat: [
                                    Constants.paths.public_url,
                                    { $ifNull: ['$createdByUser.image', Constants.paths.DEFAULT_USER_IMAGE] },
                                ],
                            },
                        },
                        updatedBy: {
                            $cond: {
                                if: { $ne: ["$updatedByUser", null] },
                                then: {
                                    id: "$updatedByUser._id",
                                    name: "$updatedByUser.name",
                                    email: "$updatedByUser.email",
                                    profilePicture: {
                                        $concat: [
                                            Constants.paths.public_url,
                                            { $ifNull: ["$updatedByUser.image", Constants.paths.DEFAULT_USER_IMAGE] },
                                        ],
                                    },
                                },
                                else: "$$REMOVE",
                            },
                        },
                    },
                },
            ];
            // Add sorting, pagination, and projection
            pipeline.push(
                { $sort: { [sortBy]: sortOrder } },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        slug: 1,
                        content: 1,
                        status: 1,
                        seo: 1,
                        createdBy: 1,
                        updatedBy: 1,
                        createdAtText: 1,
                        updatedAtText: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        ...project,
                    },

                }
            );

            // Run aggregation
            const pages = await WebPage.aggregate(pipeline).session(session);
            if (!paginate) return pages;

            // Fetch total count separately for pagination metadata
            const total = await WebPage.countDocuments(query).session(session);

            return {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                pages,
            };

        } catch (error) {
            console.error("fetchPages Error:", error);
            throw error;
        }
    }

    getList = async (data, { session = null } = {} = {}) => {
        return this.query({ session, paginate: true });
    }


    getById = async (id, { session = null } = {}) => {
        return mongoOne(await this.query({ query: [{ $match: { _id: mObj(id) } }], session, }));
    }

    getBySlug = async (slug, { session = null } = {}) => {
        return mongoOne(await this.query({ query: [{ $match: { slug } }], session, }));
    }

    create = async (data, { session = null } = {}) => {
        data.slug = constructSlug(data.slug, data.title);
        const existingPage = await this.getBySlug(data.slug, { session });
        if (existingPage) {
            throw new ApiError(0, "Slug already exists");
        }
        logg(data)
        let page = new WebPage({
            title: data.title,
            slug: data.slug,
            content: data.content,
            status: data.status,
            seo: {
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                keywords: data.keywords,
            },
            createdBy: data.createdBy,
        });
        page = await page.save({ session, new: true });
        return this.getById(page.id, { session });
    }

    update = async (id, data, { session = null } = {}) => {
        let existingPage = await this.getById(id, { session });
        if (!existingPage) throw new ApiError(0, ResponseCodes.ERROR.NOT_FOUND);
        if (data.slug) {
            data.slug = constructSlug(data.slug, data.title);
            if (data.slug !== existingPage.slug) {
                const matchingPage = await this.getBySlug(data.slug, { session });
                if (matchingPage) {
                    throw new ApiError(0, "Slug already exists");
                }
            }
        }
        const updateData = {
            ...(data.title && { title: data.title }),
            ...(data.slug && { slug: data.slug }),
            ...(data.content && { content: data.content }),
            ...(data.status && { status: data.status }),
            ...(data.metaTitle && { "seo.metaTitle": data.metaTitle }),
            ...(data.metaDescription && { "seo.metaDescription": data.metaDescription }),
            ...(data.keywords && { "seo.keywords": data.keywords }),
            ...data.updatedBy && { updatedBy: data.updatedBy },
        };

        await WebPage.findOneAndUpdate({ _id: id }, updateData, { new: true, session });
        return this.getById(id, { session });
    }

    delete = async (id, { session = null } = {}) => {
        const existingPage = await this.getById(id, { session });
        if (!existingPage) throw new ApiError(0, ResponseCodes.ERROR.NOT_FOUND);
        await WebPage.deleteOne({ _id: mObj(id) }).session(session);
        return existingPage;
    }

}

function constructSlug(slug, title) {
    return slug || title.toLowerCase().replace(/ /g, "-");
}

export default new WebPageDBO();

