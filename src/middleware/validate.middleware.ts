import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { AppError } from "../utils/AppError";

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // show all errors
      stripUnknown: true // remove extra fields
    });

    if (error) {
      const message = error.details.map((err) => err.message).join(", ");
      return next(new AppError(message, 400));
    }

    req.body = value; // sanitized data
    next();
  };
};