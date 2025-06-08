import Constants from "../../config/constants.js";
import NotificationDBO from "../../dbos/notification/NotificationDBO.js";

class NotificationSocketHandler {
    constructor(io, socket, user) {
        this.io = io;
        this.socket = socket;
        this.user = user;
        console.log(`🔌 [🔔] NotificationSocketHandler initialized for user: ${user?.id}`);
        this.setupListeners();
        this.handleNotificationList();
    }

    setupListeners() {
        this.socket.on('notification:list', this.handleNotificationList.bind(this));
        this.socket.on('notification:detail', this.handleNotificationDetail.bind(this));
        this.socket.on('notification:send', this.handleNotification.bind(this));
    }

    async handleNotification(data) {
        console.log('📩 New Notification:', data);

        // Emit only to the intended user (user or admin)
        const targetRoom = `user:${data.userId}` || `admin:${data.adminId}`;
        this.io.to(targetRoom).emit('notification:received', data);
    }

    async handleNotificationList() {
        console.log('📋 Fetching notification list for:', this.user?.id);
        const notifications = await NotificationDBO.list();
        this.socket.emit('notification:list', notifications);
    }

    async handleNotificationDetail(data) {
        console.log('📄 Notification detail requested:', data.id);
        // TODO: Fetch and return a specific notification
    }
}

export default NotificationSocketHandler;
