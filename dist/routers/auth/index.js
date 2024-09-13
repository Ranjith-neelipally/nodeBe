"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validationsSchema_1 = require("../../utils/validationsSchema");
const Validator_1 = require("../../MiddleWare/Validator");
const auth_1 = require("../../MiddleWare/auth");
const UserController_1 = require("../../contoller/UserController");
const AuthRouter = (0, express_1.Router)();
AuthRouter.post("/createUser", (0, Validator_1.validate)(validationsSchema_1.CreateUserSchema), UserController_1.CreateNewUser);
AuthRouter.post("/verifyEmail", (0, Validator_1.validate)(validationsSchema_1.TokenAndIdValidation), UserController_1.VerifyEmail);
AuthRouter.post("/reVerifyEmail", UserController_1.ResendVerificationEmail);
AuthRouter.post("/forgotPassword", UserController_1.GenerateResetPasswordLink);
AuthRouter.post("/verify-reset-password", (0, Validator_1.validate)(validationsSchema_1.TokenAndIdValidation), auth_1.verifyResetPasswordToken);
AuthRouter.post("/update-password", (0, Validator_1.validate)(validationsSchema_1.PasswordCheckSchema), auth_1.verifyResetPasswordToken, UserController_1.UpdatePassword);
AuthRouter.post("/sign-in", (0, Validator_1.validate)(validationsSchema_1.LoginValidationSchema), UserController_1.SignIn);
AuthRouter.get("/is-auth", auth_1.verifyLoginToken, (req, res) => {
    res.status(200).json({
        profile: req.user,
    });
});
AuthRouter.post("/log-out", auth_1.verifyLoginToken, UserController_1.Logout);
exports.default = AuthRouter;
