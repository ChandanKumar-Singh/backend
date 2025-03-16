class SmsService {
     async sendSmsNotification(userId, message) {
        console.log(`📩 Sending SMS to ${userId}: ${message}`);
        // Integrate with Twilio or another SMS provider
    }
}

export default new SmsService();
