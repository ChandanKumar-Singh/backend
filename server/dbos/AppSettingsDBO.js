import Constants from "../config/constants.js";
import { mongoOne } from "../lib/mongoose.utils.js";
import AppSettings from "../models/core/AppSettings.js";
import { logg } from "../utils/logger.js";

class AppSettingsDBO {



    async getSetting({ session }) {
        let settings = await AppSettings.findOne().session(session);
        if (!settings || settings.length === 0) {
            let newSettings = new AppSettings();
            await newSettings.save({ session });
        }
        return mongoOne(await this.query({ session }));
    }

    async get({ session }) {
        let settings = await AppSettings.findOne().session(session);
        if (!settings || settings.length === 0) {
            let newSettings = new AppSettings();
            await newSettings.save({ session });
        }
        return await AppSettings.findOne().session(session);
    }

    async updateSettings(area, settings = {}, { session }) {
        settings = settings[area] || {};
        switch (area) {
            case 'general':
                return await this.updateGeneralSettings(settings, { session });
            case 'contact':
                return await this.updateContactSettings(settings, { session });
            case 'social':
                return await this.updateSocialSettings(settings, { session });
            case 'seo':
                return await this.updateSeoSettings(settings, { session });
            case 'analytics':
                return await this.updateAnalyticsSettings(settings, { session });
            case 'controls':
                return await this.updateControlSettings(settings, { session });
            case 'credentials_email':
                return await this.updateCredentialEmailSettings(settings, { session });
            case 'credentials_sms':
                return await this.updateCredentialSmsSettings(settings, { session });
            case 'credentials_push':
                return await this.updateCredentialPushSettings(settings, { session });
            case 'security':
                return await this.updateSecuritySettings(settings, { session });
            case 'settings':
                return await this.updateAppSettings(settings, { session });
            case 'apiLimits':
                return await this.updateApiLimits(settings, { session });
            case 'app_version':
                return await this.updateAppVersion(settings, { session });
            default:
                throw new Error("Invalid settings area");
        }
    }

    async updateGeneralSettings(settings, { session }) {
        let appSettings = await this.get({ session });
        if (settings.name) appSettings.general.name = settings.name;
        if (settings.description) appSettings.general.description = settings.description;
        if (settings.logo) appSettings.general.logo = settings.logo;
        if (settings.favicon) appSettings.general.favicon = settings.favicon;
        if (settings.primaryColor) appSettings.general.primaryColor = settings.primaryColor;
        if (settings.secondaryColor) appSettings.general.secondaryColor = settings.secondaryColor;
        if (settings.tertiaryColor) appSettings.general.tertiaryColor = settings.tertiaryColor;
        await appSettings.save({ session, new: true });
        return mongoOne(await this.query({ session }));
    }

    async updateContactSettings(settings, { session }) {
        let appSettings = await this.get({ session });
        if (settings.email) appSettings.contact.email = settings.email;
        if (settings.phone) appSettings.contact.phone = settings.phone;
        if (settings.address) appSettings.contact.address = settings.address;
        if (settings.city) appSettings.contact.city = settings.city;
        if (settings.state) appSettings.contact.state = settings.state;
        if (settings.country) appSettings.contact.country = settings.country;
        if (settings.zip) appSettings.contact.zip = settings.zip;
        return await appSettings.save({ session, new: true });
    }

    async updateSocialSettings(settings, { session }) {
        let appSettings = await this.get({ session });
        if (settings.facebook) appSettings.social.facebook = settings.facebook;
        if (settings.twitter) appSettings.social.twitter = settings.twitter;
        if (settings.instagram) appSettings.social.instagram = settings.instagram;
        if (settings.linkedin) appSettings.social.linkedin = settings.linkedin;
        if (settings.youtube) appSettings.social.youtube = settings.youtube;
        return await appSettings.save({ session, new: true });
    }

    async updateSeoSettings(settings, { session }) {
        let appSettings = await this.get({ session });
        if (settings.title) appSettings.seo.title = settings.title;
        if (settings.description) appSettings.seo.description = settings.description;
        if (settings.keywords) appSettings.seo.keywords = settings.keywords;
        return await appSettings.save({ session, new: true });
    }

    async updateAnalyticsSettings(settings, { session }) {
        let appSettings = await this.get({ session });
        if (settings.google) appSettings.analytics.google = settings.google;
        if (settings.facebook) appSettings.analytics.facebook = settings.facebook;
        if (settings.twitter) appSettings.analytics.twitter = settings.twitter;
        if (settings.linkedin) appSettings.analytics.linkedin = settings.linkedin;
        return await appSettings.save({ session, new: true });
    }

    async updateControlSettings(settings, { session }) {
        let appSettings = await this.get({ session });
        if (settings.isMaintenance) appSettings.controls.isMaintenance = settings.isMaintenance;
        if (settings.isUnderConstruction) appSettings.controls.isUnderConstruction = settings.isUnderConstruction;
        if (settings.isLive) appSettings.controls.isLive = settings.isLive;
        return await appSettings.save({ session, new: true });
    }

    async updateCredentialEmailSettings(settings, { session }) {
        let appSettings = await this.get({ session });
        if (settings.host) appSettings.credentials.email.host = settings.host;
        if (settings.port) appSettings.credentials.email.port = settings.port;
        if (settings.secure) appSettings.credentials.email.secure = settings.secure;
        if (settings.user) appSettings.credentials.email.user = settings.user;
        if (settings.pass) appSettings.credentials.email.pass = settings.pass;
        return await appSettings.save({ session, new: true });
    }

    async updateCredentialSmsSettings(settings, { session }) {
        let appSettings = await this.get({ session });
        if (settings.apiKey) appSettings.credentials.sms.apiKey = settings.apiKey;
        if (settings.senderId) appSettings.credentials.sms.senderId = settings.senderId;
        return await appSettings.save({ session, new: true });
    }

    async updateCredentialPushSettings(settings, { session }) {
        let appSettings = await this.get({ session });
        if (settings.apiKey) appSettings.credentials.push.apiKey = settings.apiKey;
        if (settings.senderId) appSettings.credentials.push.senderId = settings.senderId;
        return await appSettings.save({ session, new: true });
    }

    async updateSecuritySettings(settings, { session }) {
        let appSettings = await this.get({ session });
        if (settings.sessionTimeout) appSettings.security.sessionTimeout = settings.sessionTimeout;
        if (settings.maxLoginAttempts) appSettings.security.maxLoginAttempts = settings.maxLoginAttempts;
        if (settings.lockoutDuration) appSettings.security.lockoutDuration = settings.lockoutDuration;
        if (settings.allowedIPs) appSettings.security.allowedIPs = settings.allowedIPs;
        if (settings.blockedIPs) appSettings.security.blockedIPs = settings.blockedIPs;
        return await appSettings.save({ session, new: true });
    }

    async updateAppSettings(settings, { session }) {
        let appSettings = await this.get({ session });
        if (settings.timezone) appSettings.settings.timezone = settings.timezone;
        if (settings.currency) appSettings.settings.currency = settings.currency;
        if (settings.language) appSettings.settings.language = settings.language;
        return await appSettings.save({ session, new: true });
    }

    async updateApiLimits(settings, { session }) {
        let appSettings = await this.get({ session });
        logg(settings);
        if (settings.maxRetry) appSettings.apiLimits.maxRetry = settings.maxRetry;
        if (settings.sessionCount) appSettings.apiLimits.sessionCount = settings.sessionCount;
        return await appSettings.save({ session, new: true });
    }

    async updateAppVersion(settings, { session }) {
        let appSettings = await this.get({ session });
        if (settings.ios) {
            if (settings.ios.version) appSettings.app.version.ios.version = settings.ios.version;
            if (settings.ios.build) appSettings.app.version.ios.build = settings.ios.build;
            if (settings.ios.forceUpdate) appSettings.app.version.ios.forceUpdate = settings.ios.forceUpdate;
            if (settings.ios.updateMessage) appSettings.app.version.ios.updateMessage = settings.ios.updateMessage;
            if (settings.ios.url) appSettings.app.version.ios.url = settings.ios.url;
            if (settings.ios.log) appSettings.app.version.ios.changelogs = this.manageChangelogs(appSettings.app.version.ios, { version: settings.ios.version, build: settings.ios.build, change: settings.ios.log });
        }
        if (settings.android) {
            if (settings.android.version) appSettings.app.version.android.version = settings.android.version;
            if (settings.android.build) appSettings.app.version.android.build = settings.android.build;
            if (settings.android.forceUpdate) appSettings.app.version.android.forceUpdate = settings.android.forceUpdate;
            if (settings.android.updateMessage) appSettings.app.version.android.updateMessage = settings.android.updateMessage;
            if (settings.android.url) appSettings.app.version.android.url = settings.android.url;
            if (settings.android.log) appSettings.app.version.android.changelogs = this.manageChangelogs(appSettings.app.version.android, { version: settings.android.version, build: settings.android.build, change: settings.android.log });
        }
        return await appSettings.save({ session, new: true });
    }

    manageChangelogs(existing, change) {
        if (!existing.changelogs) existing.changelogs = [];
        let index = existing.changelogs.findIndex(val => val.version === change.version && val.build == change.build);
        if (index > -1) {
            existing.changelogs[index] = { ...existing.changelogs[index], ...change };
        } else {
            existing.changelogs.push(change);
        }
        return existing.changelogs;
    }

    getPublicSettings(settings) {
        if (!settings) return null;
        return {
            general: settings.general,
            contact: settings.contact,
            social: settings.social,
            seo: settings.seo,
            analytics: settings.analytics,
            controls: settings.controls,
            app: settings.app,
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt,
        };
    }

    async query({ session }) {
        const baseImagePath = Constants.paths.public_url;

        const pipeline = [
            {
                $project: {
                    _id: 0,

                    general: {
                        name: 1,
                        description: 1,
                        logo: { $concat: [baseImagePath, { $ifNull: ["$general.logo", ""] }] },
                        favicon: { $concat: [baseImagePath, { $ifNull: ["$general.favicon", ""] }] },
                        primaryColor: 1,
                        secondaryColor: 1,
                        tertiaryColor: 1,
                    },

                    contact: 1,
                    social: 1,
                    seo: 1,
                    analytics: 1,
                    controls: 1,
                    credentials: 1,
                    security: 1,
                    settings: 1,
                    apiLimits: 1,

                    app: {
                        version: {
                            ios: {
                                version: 1,
                                build: 1,
                                forceUpdate: 1,
                                updateMessage: 1,
                                url: 1,
                                changelogs: 1,
                            },
                            android: {
                                version: 1,
                                build: 1,
                                forceUpdate: 1,
                                updateMessage: 1,
                                url: 1,
                                changelogs: 1,
                            },
                        },
                    },

                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ];

        // Execute aggregation with session if provided
        const results = await AppSettings.aggregate(pipeline).session(session).exec();

        // Return single settings doc or null if none found
        return results.length > 0 ? results[0] : null;
    }

}

export default new AppSettingsDBO();