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
exports.UpdatePassword = void 0;
const resetPassword_1 = __importDefault(require("../../../modals/resetPassword"));
const userModal_1 = __importDefault(require("../../../modals/userModal"));
const mail_1 = require("../../../utils/mail");
const UpdatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, userId } = req.body;
    const user = yield userModal_1.default.findById(userId);
    if (!user) {
        return res.status(403).json({ error: "Unauthorised Access" });
    }
    const matched = yield user.comparePassword(password);
    if (matched) {
        res.status(422).json({ error: "new Passsword must be Unique!" });
    }
    user.password = password;
    yield user.save();
    yield resetPassword_1.default.findOneAndDelete({ owner: user._id });
    (0, mail_1.sendSuccessEmail)({
        name: user.userName,
        email: user.email
    });
    res.status(200).json({ message: "Password Updated" });
});
exports.UpdatePassword = UpdatePassword;
