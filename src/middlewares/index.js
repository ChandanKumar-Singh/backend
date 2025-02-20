export const assignQueryAndParamsToBody = (req, res, next) => {
  req.body = {
    ...req.body,
    ...req.query,
    ...req.params,
  };

  next();
};
