import mongoose from "mongoose";
import moment from "moment";
import DateUtils from "../utils/DateUtils.js";
import { logg, LogUtils } from "../utils/logger.js";
import Constants from "../config/constants.js";

class QueryUtils {
    /**
     * Safely builds a MongoDB query object from request filters.
     * Supports sorting, pagination, and full-text search using regexFields.
     * @param {Object} req - The request object.
     * @param {Set} allowedFields - Set of valid field names to prevent injection.
     * @param {Array} regexFields - Fields to apply global search (`query`) using regex.
     * @returns {Object} Secure MongoDB query object.
     */
    buildQuery = (
        {
            query = "",
            query_data = [],
            index = 1,
            row = "createdAt",
            order = "asc",
            timezone = Constants.TIME_ZONE_NAME,
        },
        allowedFields = new Set(),
        regexFields = []
    ) => {
        const sort = { [row]: order === "desc" ? -1 : 1 };
        const page = parseInt(index) > 1 ? parseInt(index) - 1 : 1;

        // ✅ Global Text Search (`query`)
        if (
            typeof query === "string" &&
            query.trim().length > 0 &&
            regexFields.length > 0
        ) {
            const regexQueryArr = regexFields
                .filter((field) => field) // Ensure valid field names
                .map((field) => ({
                    [field]: { $regex: query, $options: "i" },
                }));
            console.log("🔍", regexQueryArr);
            if (regexQueryArr.length > 0) dbQuery.push({ $or: regexQueryArr });
        }
        if (!Array.isArray(query_data) || query_data.length === 0) {
            return {
                isSearch: query.trim().length > 0,
                page,
                midQuery: [],
                query: [],
                sort,
                timezone,
            };
        }

        const dbQuery = [];
        let fromDate = null,
            toDate = null;

        query_data.forEach(({ name, value, type, operator }) => {
            if (!name || value === undefined || value === null) return;

            // 🚨 Prevent NoSQL Injection: Validate field names
            if (allowedFields.size > 0 && !allowedFields.has(name)) {
                LogUtils.warn(`Blocked potential injection attempt on field: ${name}`);
                return;
            }

            // 🚨 Prevent Injection: Ensure type safety for values
            if (typeof value === "string") {
                value = value.replace(/[\$]/g, ""); // Remove potential NoSQL operators
            }

            switch (type) {
                case "select":
                    if (Array.isArray(value)) {
                        dbQuery.push({ [name]: { $in: value.map((val) =>this.stringORId(value)) } });
                    } else {
                        dbQuery.push({ [name]: this.stringORId(value) });
                    }
                    break;

                case "selectObject":
                    dbQuery.push({
                        [name]: this.stringORId(value),
                    });
                    break;

                case "date":
                    if (operator === "gte")
                        dbQuery.push({ [name]: { $gte: new Date(value) } });
                    else if (operator === "lte")
                        dbQuery.push({ [name]: { $lte: new Date(value) } });
                    else if (operator === "eq")
                        dbQuery.push({ [name]: { $eq: new Date(value) } });
                    else if (operator === "ne")
                        dbQuery.push({ [name]: { $ne: new Date(value) } });
                    else {
                        const start = new Date(moment(value).startOf("day").toISOString());
                        const end = new Date(moment(value).endOf("day").toISOString());
                        dbQuery.push({ [name]: { $gte: start, $lte: end } });
                    }
                    break;

                case "number":
                    if (!isNaN(value)) {
                        value = parseFloat(value);
                        if (operator === "gte") dbQuery.push({ [name]: { $gte: value } });
                        else if (operator === "lte")
                            dbQuery.push({ [name]: { $lte: value } });
                        else if (operator === "gt")
                            dbQuery.push({ [name]: { $gt: value } });
                        else if (operator === "lt")
                            dbQuery.push({ [name]: { $lt: value } });
                        else if (operator === "ne")
                            dbQuery.push({ [name]: { $ne: value } });
                        else dbQuery.push({ [name]: { $eq: value } });
                    }
                    break;

                case "array":
                    if (Array.isArray(value)) {
                        dbQuery.push({
                            [name]: {
                                [operator === "nin" ? "$nin" : "$in"]: value.map((val) =>
                                    String(val)
                                ),
                            },
                        });
                    }
                    break;

                /*                 case "regex":
                                                    if (typeof value === "string" && value.length > 0) {
                                                        console.log("🔍", value);
                                                        dbQuery.push({ [name]: { $regex: new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") } });
                                                    }
                                                    break;
                                 */
                /*                 case "text":
                                                    if (typeof value === "string" && value.length > 0) {
                                                        dbQuery.push({ [name]: { $regex: new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i") } });
                                                    }
                                                    break;
                                 */
                case "exists":
                    dbQuery.push({ [name]: { $exists: !!value } });
                    break;

                case "nullCheck":
                    dbQuery.push({ [name]: { $exists: true, $ne: null } });
                    break;

                case "range":
                    if (Array.isArray(value) && value.length === 2) {
                        dbQuery.push({ [name]: { $gte: value[0], $lte: value[1] } });
                    }
                    break;

                default:
                    LogUtils.warn(`Unsupported query type: ${type}`);
                    break;
            }
        });

        if (fromDate || toDate) {
            const dateQuery = { $and: [] };
            if (fromDate)
                dateQuery["$and"].push({
                    createdAt: {
                        $gte: new Date(
                            DateUtils.formattedTimeZone(fromDate, "00:00:00", timezone)
                        ),
                    },
                });
            if (toDate)
                dateQuery["$and"].push({
                    createdAt: {
                        $lte: new Date(
                            DateUtils.formattedTimeZone(toDate, "23:59:59", timezone)
                        ),
                    },
                });
            dbQuery.push(dateQuery);
        }



        const fQuery = dbQuery.length ? { $and: dbQuery } : {};

        let data = {
            isSearch: query.trim().length > 0,
            page,
            midQuery: [],
            query: [{ $match: fQuery }],
            sort,
            timezone,
        };

        // logg("🔍 Query:", JSON.stringify(data, null, 2));
        return data;
    };

    stringORId(value) {
        return mongoose.Types.ObjectId.isValid(value)
            ? new mongoose.Types.ObjectId(value)
            : String(value);
    }
}

export default new QueryUtils();
