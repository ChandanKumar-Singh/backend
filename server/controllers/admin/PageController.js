import WebPageDBO from "../../dbos/WebPageDBO.js";
import catchAsync from "../../lib/catchAsync.js";
import { withTransaction } from "../../lib/mongoose.utils.js";
import { logg } from "../../utils/logger.js";
import resConv from "../../utils/resConv.js";
import httpStatus from 'http-status'

class PageController {
    list = catchAsync(async (req, res) => {
        const { page, limit, sort, order } = req.query;
        const data = await WebPageDBO.getList({ page, limit, sort, order });
        res.status(httpStatus.OK).json(resConv(data));
    });

    create = catchAsync(async (req, res) => withTransaction(async (session) => {
        const page = await WebPageDBO.create(req.user.id, req.body, { session });
        res.status(httpStatus.OK).json(resConv(page, `${page.title} created successfully`));
    }));

    updateWebPage = catchAsync(async (req, res) => withTransaction(async (session) => {
        const { id } = req.params;
        const page = await WebPageDBO.update(id, req.user.id, req.body, { session });
        res.status(httpStatus.OK).json(resConv(page, `${page.title} updated successfully`));
    }));

    delete = catchAsync(async (req, res) => withTransaction(async (session) => {
        const { id } = req.body;
        const page = await WebPageDBO.delete(id, { session });
        res.status(httpStatus.OK).json(resConv(page, `${page.title} deleted successfully`));
    }));


}

export default new PageController();