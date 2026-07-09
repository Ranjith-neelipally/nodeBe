import { RequestHandler } from "express";
import * as yup from "yup";
import { AppError } from "../utils/AppError";

export const validate = (schema: any): RequestHandler => {
  return async (req, res, next) => {
    const data =
      Object.keys(req.body || {}).length > 0
        ? req.body
        : Object.keys(req.query || {}).length > 0
        ? req.query
        : req.params;

    const schemaToValidate = yup.object({
      data: schema,
    });

    try {
      await schemaToValidate.validate({ data }, { abortEarly: false });

      // normalize for downstream middlewares/controllers
      req.body = data;

      return next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return next(
          new AppError(
            "Validation failed.",
            422,
            "VALIDATION_ERROR",
            error.errors,
          ),
        );
      }

      return next(error);
    }
  };
};
