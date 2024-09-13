"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginValidationSchema = exports.PasswordCheckSchema = exports.TokenAndIdValidation = exports.CreateUserSchema = void 0;
const yup = __importStar(require("yup"));
const mongoose_1 = require("mongoose");
const PasswordvalidationExpression = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]{8,}$/;
exports.CreateUserSchema = yup.object().shape({
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
exports.TokenAndIdValidation = yup.object().shape({
    token: yup.string().trim().required("Invalid token!"),
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("UserId is invalid or missing."),
});
exports.PasswordCheckSchema = yup.object().shape({
    token: yup.string().trim().required("Invalid token!"),
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
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
exports.LoginValidationSchema = yup.object().shape({
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
