import { RequestHandler } from "express";
import * as yup from "yup";

export const validate = (schema: any): RequestHandler => {
  return async (req, res, next) => {
    const data =
      Object.keys(req.body || {}).length > 0
        ? req.body
        : Object.keys(req.query || {}).length > 0
        ? req.query
        : req.params;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Request data is empty" });
    }

    const schemaToValidate = yup.object({
      data: schema,
    });

    try {
      await schemaToValidate.validate({ data }, { abortEarly: false });

      // normalize for downstream middlewares/controllers
      req.body = data;

      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(422).json({ errors: error.errors });
      }

      console.error("Validation error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};
