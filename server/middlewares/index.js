import Constants from "../config/constants.js";
import { logg } from "../utils/logger.js";

export const assignQueryAndParamsToBody = (req, res, next) => {
  // logg("Before merging:", req.query, req.params, req.body);
  req.body = {
    ...req.body,
    ...req.query,
    ...req.params,
    ...{
      timezone: req.headers.timezone || Constants.TIME_ZONE_NAME,
    }
  };

  // logg("After merging:", req.body);

  next();
};
