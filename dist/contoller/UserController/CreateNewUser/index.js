"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNewUser = void 0;
const userModal_1 = __importDefault(require("../../../modals/userModal"));
const helpers_1 = require("../../../utils/helpers");
const mail_1 = require("../../../utils/mail");
const authTokens_1 = require("../../../utils/authTokens");
const asyncHandler_1 = require("../../../utils/asyncHandler");
const apiResponse_1 = require("../../../utils/apiResponse");
exports.CreateNewUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, userName } = req.body;
    const user = yield userModal_1.default.create({
        email,
        password,
        userName,
    });
    const tempToken = (0, helpers_1.generateToken)(6);
    const verificationToken = (0, authTokens_1.signEmailVerificationToken)(user._id.toString(), yield (0, authTokens_1.hashEmailCode)(tempToken));
    yield (0, mail_1.sendVerificationMail)(tempToken, {
        email,
        name: userName,
        userId: user._id.toString(),
    });
    return (0, apiResponse_1.sendSuccess)(res, {
        user_id: user._id,
        verificationToken,
    }, 201);
}));
