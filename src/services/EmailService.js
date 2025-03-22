import { logg, LogUtils } from "../utils/logger.js";
import path from "path";
import fs from "fs";
import ejs from "ejs";
import Constants from "../config/constants.js";


class EmailService {
    async sendEmailNotification(userId, subject, message) {
        logg(`📧 Sending Email to ${userId}: ${subject} : ${message}`);
        // Use Nodemailer or an email provider like SendGrid
    }

    sendEmail = async (userId) => {
        const subject = 'Welcome to our Platform!';
        const message = 'You have successfully registered on our platform. Welcome aboard!';

    }

    sendForgotPasswordEmail = async (userId, payload) => {
        const subject = 'Forgot Password Request';
        const message = `Your verification code is ${payload.resetPasswordToken}`;
        this.sendEmailNotification(userId, subject, message);
    }
    /**
     * Renders an email template directly in the browser.
     * @param {Object} res - Express response object.
     * @param {string} template - Name of the EJS template (without .ejs extension).
     * @param {Object} templateData - Data to inject into the template.
     */
    renderEmailTemplate = async (res, template, templateData = {}) => {
        try {
            const templatePath = path.join(Constants.paths.root_public, "views/templates", `${template}.ejs`);
            if (!fs.existsSync(templatePath)) {
                return res.status(404).send("Template not found.");
            }
            ejs.renderFile(templatePath, { ...templateData, url: Constants.public_url }, (err, renderedHtml) => {
                if (err) {
                    logg(err);
                    return res.status(500).send(`Error rendering email., ${err}`);}
                res.send(renderedHtml);
            });
        } catch (error) {
            logg(error);
            res.status(500).send(`Internal Server Error. ${ error }`);
        }
    }

}

export default new EmailService();
