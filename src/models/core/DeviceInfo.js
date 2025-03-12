import mongoose from "mongoose";
import Constants from "../../config/constants.js";



const DeviceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    deviceId: {
        type: String,
        required: true,
        unique: true
    },

    fingerprint: {
        type: String,
        default: null
    },

    deviceType: {
        type: String,
        enum: Object.values(Constants.Device.deviceType),
        default: "unknown"
    },

    os: {
        type: String,
        enum: Object.values(Constants.Device.os),
        required: true
    },

    osVersion: {
        type: String,
        required: true
    },

    appVersion: {
        type: String,
        default: null
    },

    screenSize: {
        type: String,
        default: null
    },

    ipAddress: {
        type: String,
        required: true
    },

    location: {
        lat: { type: Number, default: null },
        lon: { type: Number, default: null }
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastActiveAt: {
        type: Date,
        default: Date.now
    },

    fcmToken: {
        type: String,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("Device", DeviceSchema);
