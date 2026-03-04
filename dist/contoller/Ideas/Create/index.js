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
exports.CreateNewIdea = void 0;
const Idea_1 = __importDefault(require("../../../modals/Idea"));
const CreateNewIdea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, idea, date } = req.body;
    try {
        const newNote = yield Idea_1.default.create({
            userId,
            idea,
            date,
        });
        res.status(201).json({ newNote });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
exports.CreateNewIdea = CreateNewIdea;
