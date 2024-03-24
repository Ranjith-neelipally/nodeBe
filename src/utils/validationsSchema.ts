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

export const EmailVerifictionBody = yup.object().shape({
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
});
