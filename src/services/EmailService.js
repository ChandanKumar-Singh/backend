class EmailService {
     async sendEmailNotification(userId, subject, message) {
        console.log(`📧 Sending Email to ${userId}: ${subject}`);
        // Use Nodemailer or an email provider like SendGrid
    }
}

export default new EmailService();
