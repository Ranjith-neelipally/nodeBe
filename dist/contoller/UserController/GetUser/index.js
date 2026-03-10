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
exports.GetUser = void 0;
const userModal_1 = __importDefault(require("../../../modals/userModal"));
const GetUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModal_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({
            profile: {
                id: user._id,
                name: user.userName,
                verified: user.verified,
                projects: user.ProjectIds,
                email: user.email,
                createdAt: user.createdAt || user._id.getTimestamp(),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.GetUser = GetUser;
