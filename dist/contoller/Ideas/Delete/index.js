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
exports.DeleteIdea = void 0;
const Idea_1 = __importDefault(require("../../../modals/Idea"));
const DeleteIdea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.body;
    const userId = req.user.id;
    try {
        const idea = yield Idea_1.default.find({
            _id: _id,
            userId: userId,
        });
        if (idea.length === 0) {
            return res.status(404).json({ error: "Idea not found!" });
        }
        yield Idea_1.default.deleteOne({ _id: _id, userId: userId });
        return res.status(200).json({ message: "Idea deleted successfully!" });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
});
exports.DeleteIdea = DeleteIdea;
