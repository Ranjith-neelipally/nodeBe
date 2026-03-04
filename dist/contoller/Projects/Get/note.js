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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNotes = void 0;
const Notes_1 = require("../../../modals/Projects/Notes");
const GetNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, projectId, plotId } = req.query;
    try {
        const notes = yield Notes_1.Notes.findOne({
            userId: userId,
            projectId: projectId,
            plotId: plotId,
        });
        return res.status(200).json({ data: notes });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
});
exports.GetNotes = GetNotes;
