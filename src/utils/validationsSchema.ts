import * as yup from "yup";
import { isValidObjectId } from "mongoose";

const PasswordvalidationExpression =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]{8,}$/;

export const CreateUserSchema = yup.object().shape({
  userName: yup
    .string()
    .trim()
    .required("Name is missing")
    .min(3, "Name is too short, Name should be more than 3 char")
    .max(20, "name is too long"),
  email: yup
    .string()
    .trim()
    .required("email is required")
    .email("invalid email id!"),
  password: yup
    .string()
    .trim()
    .required("Password is missing")
    .min(8, "Password is too short!")
    .matches(PasswordvalidationExpression, "Password is too simple"),
});

export const TokenAndIdValidation = yup.object().shape({
  token: yup.string().trim().required("Invalid token!"),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
});

export const PasswordCheckSchema = yup.object().shape({
  token: yup.string().trim().required("Invalid token!"),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })

    .required("Invalid userId"),
  password: yup
    .string()
    .trim()
    .required("Password is missing")
    .min(8, "Password is too short!")
    .matches(PasswordvalidationExpression, "Password is too simple"),
});

export const LoginValidationSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required("email is required")
    .email("invalid email id!"),
  password: yup
    .string()
    .trim()
    .required("Password is missing")
    .min(8, "Password is too short!")
    .matches(PasswordvalidationExpression, "Password is too simple"),
});

export const CreateIdeaSchema = yup.object().shape({
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
  idea: yup
    .string()
    .trim()
    .required("Idea content is required")
    .max(1000, "Idea is too long"),
  date: yup.date().required("Date is required"),
});

export const editIdeaSchema = yup.object().shape({
  _id: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("Idea id is invalid or missing."),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
  idea: yup
    .string()
    .trim()
    .required("Idea content is required")
    .max(1000, "Idea is too long"),
  date: yup.date().notRequired(),
});

export const GetIdeaSchema = yup.object().shape({
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
  date: yup.date().notRequired(),
  limit: yup
    .number()
    .min(1, "Limit must be at least 1.")
    .max(100, "Limit cannot exceed 100.")
    .notRequired(),
  page: yup.number().min(1, "Page must be at least 1.").notRequired(),
});

export const DeleteIdeaSchema = yup.object().shape({
  _id: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("Idea id is invalid or missing."),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
});

export const ProfileVerificationCodeSchema = yup.object().shape({
 userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
  code: yup.string().trim().required("Verification code is required"),
});