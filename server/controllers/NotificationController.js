import catchAsync from "../lib/catchAsync.js";
import httpStatus from "http-status";
import resConv from "../utils/resConv.js";
import NotificationDBO from "../dbos/notification/NotificationDBO.js";

class NotificationController {
    list = catchAsync(async (req, res) => {
        const notifications = await NotificationDBO.list();
        res.status(httpStatus.OK).send(resConv(notifications
        ));
    });
}

export default new NotificationController();