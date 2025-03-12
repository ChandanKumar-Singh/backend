import mongoose from 'mongoose';


const ChangeLogSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    version: { type: String, required: true },
    build: { type: Number, required: true },
    change: { type: String, default: '' },
},
    {
        timestamps: true,
    }
);

const AppSettingSchema = new mongoose.Schema(
    {
        general: {
            name: { type: String, default: 'New Project' },
            description: { type: String },
            logo: { type: String },
            favicon: { type: String },
            primaryColor: { type: String, default: '#1900FEFF' },
            secondaryColor: { type: String, default: '#5DDCF3FF' },
            tertiaryColor: { type: String, default: '#8640F6FF' },
        },

        contact: {
            email: { type: String, default: '' },
            phone: { type: String, default: '' },
            address: { type: String, default: '' },
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            country: { type: String, default: '' },
            zip: { type: String, default: '' },
        },

        social: {
            facebook: { type: String, default: '' },
            twitter: { type: String, default: '' },
            instagram: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            youtube: { type: String, default: '' },
        },

        seo: {
            title: { type: String, default: '' },
            description: { type: String, default: '' },
            keywords: [{ type: String, default: '' }],
        },

        analytics: {
            google: { type: String, default: '' },
            facebook: { type: String, default: '' },
            twitter: { type: String, default: '' },
            linkedin: { type: String, default: '' },
        },

        controls: {
            isMaintenance: { type: Boolean, default: false },
            isUnderConstruction: { type: Boolean, default: false },
            isLive: { type: Boolean, default: true },
        },

        credentials: {
            email: {
                host: { type: String, default: '' },
                port: { type: String, default: '' },
                secure: { type: Boolean, default: false },
                user: { type: String, default: '' },
                pass: { type: String, default: '' },
            },
            sms: {
                apiKey: { type: String, default: '' },
                senderId: { type: String, default: '' },
            },
            push: {
                apiKey: { type: String, default: '' },
                senderId: { type: String, default: '' },
            },
        },
        security: {
            sessionTimeout: { type: Number, default: 30 }, // in minutes
            maxLoginAttempts: { type: Number, default: 5 },
            lockoutDuration: { type: Number, default: 15 }, // in minutes
            allowedIPs: [{ type: String }], // Whitelist
            blockedIPs: [{ type: String }], // Blacklist
        },

        settings: {
            timezone: { type: String, default: 'Asia/Kolkata' },
            currency: { type: String, default: 'INR' },
            language: { type: String, default: 'en' },
        },

        apiLimits: {
            maxRetry: { type: Number, default: 5000 },
            sessionCount: { type: Number, default: 3 },
        },

        app: {
            version: {
                ios: {
                    version: { type: String, default: '1.0.0' },
                    build: { type: String, default: '1' },
                    forceUpdate: { type: Boolean, default: false },
                    updateMessage: { type: String, default: '' },
                    url: { type: String, default: '' },
                    changelogs: [ChangeLogSchema],
                },
                android: {
                    version: { type: String, default: '1.0.0' },
                    build: { type: String, default: '1' },
                    forceUpdate: { type: Boolean, default: false },
                    updateMessage: { type: String, default: '' },
                    url: { type: String, default: '' },
                    changelogs: [ChangeLogSchema],
                },
            },
        },

    },
    {
        timestamps: true,
    }
);

export default mongoose.model('AppSetting', AppSettingSchema);
