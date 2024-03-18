import * as yup from "yup";

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
