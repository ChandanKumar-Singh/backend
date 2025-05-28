
// import AWS from "aws-sdk";
import nodemailer from "nodemailer";
// import mg from "nodemailer-mailgun-transport";
import ejs from "ejs";
import path from "path";
import Constants from "../config/constants.js";
import { LogUtils } from "./logger.js";



class EmailUtils {
    constructor() {
        // Setup SMTP Transporter
        this.smtpTransporter = nodemailer.createTransport({
            host: Constants.SMTP.HOST,
            port: Constants.SMTP.PORT_NUMBER,
            secure: false, // Use true for 465, false for other ports
            auth: {
                user: Constants.SMTP.USERNAME,
                pass: Constants.SMTP.PASSWORD,
            },
        });

        // Setup Mailgun Transporter
        this.nodemailerMailgun = nodemailer.createTransport(mg({
            auth: {
                api_key: Constants.MAILGUN_API_KEY,
                domain: Constants.MAILGUN_DOMAIN,
            },
        }));

        // Setup AWS SES Configuration
        this.sesConfig = {
            apiVersion: "2010-12-01",
            accessKeyId: Constants.AWS_SES.accessKeyId,
            secretAccessKey: Constants.AWS_SES.secretAccessKey,
            region: Constants.AWS_SES.region,
        };
    }

    /**
     * 📌 Render Email Templates
     */
    async renderTemplate(templateName, templateData = {}) {
        try {
            const templatePath = path.join(Constants.ROOT_PATH, `templates/emailTemplates/${templateName}.ejs`);
            return await ejs.renderFile(templatePath, { ...templateData, url: Constants.PUBLIC_URL });
        } catch (error) {
            LogUtils.error("Error rendering email template", error);
            throw new Error("Failed to render email template.");
        }
    }

    /**
     * 📌 Send Email via AWS SES
     */
    async sendEmailViaAWS(email, subject, content) {
        try {
            const ses = new AWS.SES(this.sesConfig);
            const params = {
                Destination: { ToAddresses: [email] },
                Message: {
                    Body: {
                        Html: { Charset: "UTF-8", Data: content },
                        Text: { Charset: "UTF-8", Data: content },
                    },
                    Subject: { Charset: "UTF-8", Data: subject },
                },
                Source: Constants.DEFAULT_EMAIL,
            };

            await ses.sendEmail(params).promise();
            LogUtils.log(`✅ AWS SES Email sent to ${email}`);
        } catch (error) {
            LogUtils.error("❌ AWS SES Email Error", error);
            throw new Error("Failed to send email via AWS SES.");
        }
    }

    /**
     * 📌 Send Email via Mailgun
     */
    async sendEmailViaMailgun(email, subject, content) {
        try {
            await this.nodemailerMailgun.sendMail({
                from: `${Constants.PROJECT_NAME} <${Constants.DEFAULT_EMAIL}>`,
                to: email,
                subject: subject,
                html: content,
            });
            LogUtils.log(`✅ Mailgun Email sent to ${email}`);
        } catch (error) {
            LogUtils.error("❌ Mailgun Email Error", error);
            throw new Error("Failed to send email via Mailgun.");
        }
    }

    /**
     * 📌 Send Email via SMTP
     */
    async sendEmailViaSMTP(email, subject, content) {
        try {
            await this.smtpTransporter.sendMail({
                from: `${Constants.PROJECT_NAME} <${Constants.SMTP.USERNAME}>`,
                to: email,
                subject: subject,
                html: content,
            });
            LogUtils.log(`✅ SMTP Email sent to ${email}`);
        } catch (error) {
            LogUtils.error("❌ SMTP Email Error", error);
            throw new Error("Failed to send email via SMTP.");
        }
    }

    /**
     * 📌 Universal Send Email Function
     */
    async sendEmail(email, subject, templateName, templateData = {}) {
        try {
            const content = await this.renderTemplate(templateName, templateData);

            // Uncomment the method you prefer
            await this.sendEmailViaSMTP(email, subject, content);
            // await this.sendEmailViaAWS(email, subject, content);
            // await this.sendEmailViaMailgun(email, subject, content);
        } catch (error) {
            LogUtils.error("❌ Error in sendEmail", error);
        }
    }

    /**
     * 📌 Send Password Reset Email
     */
    async sendForgotPasswordEmail(email, name, token) {
        await this.sendEmail(email, "Reset Your Password", "forgotPassword", {
            name,
            link: `${Constants.ADMIN_PANEL_URL}reset/password?token=${token}`,
        });
    }

    /**
     * 📌 Send Welcome Email
     */
    async sendWelcomeEmail(email, name) {
        await this.sendEmail(email, "Welcome to Our Platform!", "welcomeEmail", { name });
    }

    /**
     * 📌 Send Notification Email
     */
    async sendNotificationEmail(email, params = {}) {
        await this.sendEmail(email, params.subject || "Notification", "notification", params);
    }
}

module.exports = new EmailUtils();
