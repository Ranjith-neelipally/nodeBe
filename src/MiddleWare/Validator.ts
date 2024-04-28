import { RequestHandler } from "express";
import * as yup from "yup";

export const validate = (schema: any): RequestHandler => {
  return async (req, res, next) => {
    if (!req.body) {
      res.status(400).json({ error: "Body is empty" });
      return;
    }

    const schemaToValidate = yup.object({
      body: schema,
    });

    try {
      await schemaToValidate.validate(
        { body: req.body },
        {
          abortEarly: false,
        }
      );
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        res.status(422).json({ errors: error.errors });
      } else {
        console.error(
          "Validation middleware encountered an unexpected error:",
          error
        );
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
};
