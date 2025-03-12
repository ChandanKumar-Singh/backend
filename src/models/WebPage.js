import mongoose from "mongoose";
import Constants from "../config/constants.js";

const WebPage = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    status: { type: String, enum: Object.values(Constants.pageStatus), default: Constants.pageStatus.DRAFT },
    seo: {
        metaTitle: { type: String, trim: true, default: "" },
        metaDescription: { type: String, trim: true, default: "" },
        keywords: [{ type: String, trim: true }]
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

export default mongoose.model("webpage", WebPage);

