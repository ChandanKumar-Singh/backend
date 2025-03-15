import httpStatus from 'http-status';
import catchAsync from '../lib/catchAsync.js';
import FileUploadUtils from '../utils/FileUpload.utils.js';
import Constants from '../config/constants.js';
import ApiError from '../middlewares/ApiError.js';
import { mObj, withTransaction } from '../lib/mongoose.utils.js';
import resConv from '../utils/resConv.js';
import UserDBO from '../dbos/UserDBO.js';
import { logg } from '../utils/logger.js';

class UserController {
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

    detail = catchAsync(async (req, res) => {
        const { id } = req.body;
        const obj = await UserDBO.getById(mObj(id));
        if (!obj) throw new ApiError(httpStatus.OK, 'User not found');
        res.status(httpStatus.OK).send(resConv({ ...obj }));
    });

    create = catchAsync(async (req, res) => {
        const adminId = mObj(req.admin.id);
        const response = await UserDBO.createUpdateQuery({ ...req.body, adminId });
        res.status(httpStatus.OK).send(resConv(response));
    });

    update = catchAsync(async (req, res) => withTransaction(async (session) => {
        const response = await UserDBO.update(req, { session });
        res.status(httpStatus.OK).send(resConv(response));
    }));

    isExists = catchAsync(async (req, res) => {
        const { id, contact, type } = req.body;
        const isExists = await UserDBO.isExists(contact, type, mObj(id));
        res.status(httpStatus.OK).send(resConv({ is_exists: isExists }));
    });

    list = catchAsync(async (req, res) => {
        const { query_data } = req.body;
        const users = await UserDBO.getList(req);
        res.status(httpStatus.OK).send(resConv(users));
        // if (query_data[0].name == "is_member" && query_data !==null){
        //    const response = users.filter(val => val.is_member == query_data[0].value)
        //     res.status(httpStatus.OK).send(resConv(response));
        // }else{
        //     res.status(httpStatus.OK).send(resConv(users));
        // }

    });

    adminList = catchAsync(async (req, res) => {
        const response = await UserDBO.getAdminList(req);
        res.status(httpStatus.OK).send(resConv(response));
    });

    appUserList = catchAsync(async (req, res) => {
        const response = await UserDBO.getAppuserList(req);
        res.status(httpStatus.OK).send(resConv(response));
    });

    changePassword = catchAsync(async (req, res) => {
        const { emp_id, password } = req.body;
        const empId = mObj(emp_id);
        const response = await UserDBO.changePassword({
            emp_id: empId,
            password,
            // share_password,
        });
        ResUtils.status(httpStatus.OK).send(res, resConv(response));
    });

    autocomplete = catchAsync(async (req, res) => {
        const { contact, event_id } = req.body;
        const response = await UserDBO.autocomplete(contact, event_id);
        res.status(httpStatus.OK).send(resConv(response));
    });

    vcf = catchAsync(async (req, res) => {
        const { id } = req.body;
        const obj = await UserDBO.getVcf(mObj(id));
        if (!obj) throw new ApiError(httpStatus.OK, 'User not found');
        res.status(httpStatus.OK).send(resConv({ details: obj }));
    });

    exportAppUser = catchAsync(async (req, res) => {
        const response = await ExcelUtils.exportAppUser();
        ResUtils.status(httpStatus.OK).send(res, resConv({ response }));
    });
}

export default new UserController();
