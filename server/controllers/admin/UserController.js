import httpStatus from "http-status";
import catchAsync from "../../lib/catchAsync.js";
import FileUploadUtils from "../../utils/FileUpload.utils.js";
import Constants from "../../config/constants.js";
import ApiError from "../../middlewares/ApiError.js";
import { mObj, withTransaction } from "../../lib/mongoose.utils.js";
import resConv from "../../utils/resConv.js";
import UserDBO from "../../dbos/UserDBO.js";
import { logg } from "../../utils/logger.js";
import AuthenticateDBO from "../../dbos/AuthenticateDBO.js";
import EmailService from "../../services/EmailService.js";
import ResponseCodes from "../../config/ResponseCodes.js";

class UserController {
  uploadImage = catchAsync(async (req, res, next) => {
    logg("📸 Uploading image...", req.body);
    const tempUpload = await FileUploadUtils.uploadFiles(
      req,
      res,
      [{ name: "image", maxCount: 2 }],
      Constants.paths.DEFAULT_USER_IMAGE_PATH
    );
    let file = null;
    if (
      tempUpload.files &&
      "image" in tempUpload.files &&
      tempUpload.files.image.length > 0
    ) {
      file = tempUpload.files.image[0];
    }

    req.body = {
      ...req.body,
      ...tempUpload.body,
      image: file
        ? Constants.paths.DEFAULT_USER_IMAGE_PATH + file.filename
        : null,
    };
    next();
  });

  detail = catchAsync(async (req, res) => {
    const { id } = req.body;
    const obj = await UserDBO.getById(mObj(id));
    if (!obj) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    res.status(200).send(resConv({ ...obj }));
  });

  create = catchAsync(async (req, res) =>
    withTransaction(async (session) => {
      const response = await AuthenticateDBO.createUser(req.body, {
        session,
        processAuth: false,
      });
      res.status(200).send(resConv(response));
    })
  );

  update = catchAsync(async (req, res) =>
    withTransaction(async (session) => {
      const response = await UserDBO.update(req.body, { session });
      res.status(200).send(resConv(response, { message: ResponseCodes.SUCCESS_MESSAGES.USER_UPDATED(response.fullName) }));
    })
  );
  delete = catchAsync(async (req, res) => withTransaction(async (session) => {
    const response = await UserDBO.delete(req.body.id, { session });
    res.status(200).send(resConv(null, { message: response.message }));
  }));

  isExists = catchAsync(async (req, res) => {
    const { id, contact, type } = req.body;
    const isExists = await UserDBO.getById(id);
    res
      .status(200)
      .send(resConv({ is_exists: isExists !== undefined }));
  });

  list = catchAsync(async (req, res) => {
    const users = await UserDBO.getList({
      ...req.body,
    });
    res.status(200).send(resConv(users));
  });

  adminList = catchAsync(async (req, res) => {
    const response = await UserDBO.getAllAdmins();
    res.status(200).send(resConv(response));
  });

  appUserList = catchAsync(async (req, res) => {
    const response = await UserDBO.getAppuserList(req);
    res.status(200).send(resConv(response));
  });

  changePassword = catchAsync(async (req, res) => {
    const { emp_id, password } = req.body;
    const empId = mObj(emp_id);
    const response = await UserDBO.changePassword({
      emp_id: empId,
      password,
      // share_password,
    });
    ResUtils.status(200).send(res, resConv(response));
  });

  autocomplete = catchAsync(async (req, res) => {
    const { contact, event_id } = req.body;
    const response = await UserDBO.autocomplete(contact, event_id);
    res.status(200).send(resConv(response));
  });

  vcf = catchAsync(async (req, res) => {
    const { id } = req.body;
    const obj = await UserDBO.getVcf(mObj(id));
    if (!obj) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    res.status(200).send(resConv({ details: obj }));
  });

  exportAppUser = catchAsync(async (req, res) => {
    const response = await ExcelUtils.exportAppUser();
    ResUtils.status(200).send(res, resConv({ response }));
  });

  sendMail = catchAsync(async (req, res) => {
    const { template } = req.body;
    logg(Constants.paths);
    EmailService.renderEmailTemplate(res, template, {
      name: "John Doe",
      actionLink: "https://yourplatform.com/get-started",
      logo: "http://localhost:3001/public/default_user_image.png",
      // http:/localhost:3001/public/default_user_image.png
    });
  });
}

export default new UserController();
