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
exports.EditIdea = void 0;
const Idea_1 = __importDefault(require("../../../modals/Idea"));
const EditIdea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id, idea: newIdea, date } = req.body;
    const userId = req.user.id.toString();
    try {
        const idea = yield Idea_1.default.findById(_id);
        if (!idea) {
            return res.status(404).json({ error: "Idea not found!" });
        }
        if (!idea.userId || idea.userId.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized access!" });
        }
        yield Idea_1.default.updateOne({ _id: _id }, { $set: { idea: newIdea, date: date } });
        const updatedIdea = yield Idea_1.default.findById(_id);
        return res.status(200).json({ idea: updatedIdea });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
});
exports.EditIdea = EditIdea;
