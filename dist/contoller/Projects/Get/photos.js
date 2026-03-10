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
exports.GetAllPhotos = void 0;
const Notes_1 = require("../../../modals/Projects/Notes");
const GetAllPhotos = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.query;
    try {
        const notesWithPhotos = yield Notes_1.PlotNotes.find({
            userId,
        });
        const allPhotoIds = [];
        notesWithPhotos.forEach((note) => {
            note.content.forEach((item) => {
                allPhotoIds.push(...item.photoIds);
            });
        });
        return res.status(200).json({ allPhotoIds });
    }
    catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.GetAllPhotos = GetAllPhotos;
