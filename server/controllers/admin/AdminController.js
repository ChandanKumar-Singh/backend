import Constants from "../../config/constants.js";
import UserDBO from "../../dbos/UserDBO.js";
import catchAsync from "../../lib/catchAsync.js";
import FileUploadUtils from "../../utils/FileUpload.utils.js";
import httpStatus from 'http-status'
import resConv from "../../utils/resConv.js";
import AuthenticateDBO from "../../dbos/AuthenticateDBO.js";
import { withTransaction } from "../../lib/mongoose.utils.js";
import { logg } from "../../utils/logger.js";

class AdminController {
    uploadImage = catchAsync(async (req, res, next) => {
        const tempUpload = await FileUploadUtils.uploadFiles(
            req,
            res,
            [{ name: 'image', maxCount: 2 }],
            Constants.paths.DEFAULT_USER_IMAGE_PATH
        );
        let file = null;
        if ('image' in tempUpload.files && tempUpload.files.image.length > 0) {
            file = tempUpload.files.image[0];
        }

        req.body = {
            ...req.body,
            ...tempUpload.body,
            image: file ? Constants.paths.DEFAULT_USER_IMAGE_PATH + file.filename : null,
        };
        next();
    });

    uploadImages = catchAsync(async (req, res, next) => {
        const tempUpload = await FileUploadUtils.uploadFiles(
            req,
            res,
            [
                { name: 'thumbnail', maxCount: 1 },
                // { name: 'images', maxCount: 50 },
                // { name: 'videos', maxCount: 10 },
            ],
            Constants.paths.DEFAULT_USER_IMAGE_PATH
        );

        let thumbnail = null;
        if ('thumbnail' in tempUpload.files && tempUpload.files.thumbnail.length > 0) {
            thumbnail = tempUpload.files.thumbnail[0];
        }

        let images = [];
        if ('images' in tempUpload.files && tempUpload.files.images.length > 0) {
            images = tempUpload.files.images;
        }

        let videos = [];
        if ('videos' in tempUpload.files && tempUpload.files.videos.length > 0) {
            videos = tempUpload.files.videos;
        }

        req.body = {
            ...req.body,
            ...tempUpload.body,
            thumbnail: thumbnail ? Constants.paths.DEFAULT_USER_IMAGE_PATH + thumbnail.filename : null,
            images: images.map((i) => Constants.paths.DEFAULT_USER_IMAGE_PATH + i.filename),
            videos: videos.map((i) => Constants.paths.DEFAULT_USER_IMAGE_PATH + i.filename),
        };
        next();
    });

    list = catchAsync(async (req, res) => {
        const users = await UserDBO.getAllAdmins(req);
        res.status(httpStatus.OK).send(resConv(users));
    });

    create = catchAsync(async (req, res) => withTransaction(async (session) => {
        let response = await AuthenticateDBO.createAdmin(req.body, { session: session });
        res.status(httpStatus.OK).send(resConv(response));
    }));

    login = catchAsync(async (req, res) => withTransaction(async (session) => {
        let data = req.body;
        data.username = data.email;
        let response = await AuthenticateDBO.login(data, { session: session, isAdmin: true });
        res.status(httpStatus.OK).send(resConv(response));
    }));

    verifyOTP = catchAsync(async (req, res) => withTransaction(async (session) => {
        const { username, otp } = req.body;
        let response = await AuthenticateDBO.verifyOTP(username, otp, { session: session, isAdmin: true });
        res.status(httpStatus.OK).send(resConv(response));
    }));

    deleteAll = catchAsync(async (req, res) => {
        await AuthenticateDBO.deleteAllAdmins(req);
        res.status(httpStatus.OK).send(resConv({}));
    });


    ////////////////// Dashboard ///////////////
    dashboardStats = catchAsync(async (req, res) => {
        const users = await UserDBO.getUserCount(req.body);
        res.status(httpStatus.OK).send(resConv({
            totalUsers: users.total,
            totalProjects: users.total,
            activeUsers: users.total,
            completedProjects: users.total,
        }));
    });
}

export default new AdminController();