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
exports.GetIdea = void 0;
const Idea_1 = __importDefault(require("../../../modals/Idea"));
const ideasQueryLimit = 15;
const GetIdea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, userId, limit, page } = Object.assign(Object.assign({}, req.query), req.params);
    if (!userId) {
        return res.status(400).json({ error: "User ID is required!" });
    }
    try {
        let query = { userId };
        if (date) {
            query.date = date;
        }
        let ideasQuery = Idea_1.default.find(query);
        let lim = ideasQueryLimit;
        if (limit && !isNaN(Number(limit))) {
            lim = Math.max(1, Math.min(100, Number(limit)));
        }
        let pg = 1;
        if (page && !isNaN(Number(page))) {
            pg = Math.max(1, Number(page));
        }
        ideasQuery = ideasQuery.skip((pg - 1) * lim).limit(lim);
        const userIdeas = yield ideasQuery;
        return res.status(200).json({ userIdeas, page: pg, limit: lim });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
exports.GetIdea = GetIdea;
