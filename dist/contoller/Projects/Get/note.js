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
const defaultQueryLimit = 15;
const toDateString = (value) => new Date(value).toISOString().split("T")[0];
const GetNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, projectId, plotId, date, limit, page } = req.query;
    try {
        let lim = defaultQueryLimit;
        if (limit && !isNaN(Number(limit))) {
            lim = Math.max(1, Math.min(100, Number(limit)));
        }
        let pg = 1;
        if (page && !isNaN(Number(page))) {
            pg = Math.max(1, Number(page));
        }
        const query = {
            userId,
            projectId,
        };
        if (date) {
            const startDate = new Date(`${date}T00:00:00.000Z`);
            const endDate = new Date(`${date}T23:59:59.999Z`);
            query.createdAt = {
                $gte: startDate,
                $lte: endDate,
            };
        }
        else if (plotId) {
            query.plotId = plotId;
        }
        const [notes, total] = yield Promise.all([
            Notes_1.PlotNotes.find(query)
                .skip((pg - 1) * lim)
                .limit(lim),
            Notes_1.PlotNotes.countDocuments(query),
        ]);
        const formattedNotes = notes.map((note) => (Object.assign(Object.assign({}, note.toObject()), { date: toDateString(note.createdAt) })));
        return res.status(200).json({
            data: formattedNotes,
            page: pg,
            limit: lim,
            total,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
});
exports.GetNotes = GetNotes;
