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
exports.ValidateUserMiddleware = void 0;
const userModal_1 = __importDefault(require("../modals/userModal"));
const AppError_1 = require("../utils/AppError");
const ValidateUserMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next(new AppError_1.AppError("Unauthorized request.", 401, "UNAUTHORIZED"));
    }
    try {
        const user = yield userModal_1.default.findById(userId);
        if (!user) {
            return next(new AppError_1.AppError("Unauthorized request.", 401, "UNAUTHORIZED"));
        }
        req.user = user;
        return next();
    }
    catch (error) {
        return next(error);
    }
});
exports.ValidateUserMiddleware = ValidateUserMiddleware;
