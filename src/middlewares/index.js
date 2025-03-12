import { logg } from "../utils/logger.js";

export const assignQueryAndParamsToBody = (req, res, next) => {
  req.body = {
    ...req.body,
    ...req.query,
    ...req.params,
  };

  logg("After merging:", req.query, req.params, req.body);
  
  next();
};
