"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotesSchema = new mongoose_1.Schema({
    ProjectId: {
        type: String,
        require: true,
        trim: true,
    },
    NoteId: {
        type: String,
        require: true,
        trim: true,
    },
    NoteDate: {
        type: Date,
        require: true,
    },
    Note: {
        type: String,
        require: true,
    },
});
exports.default = (0, mongoose_1.model)("NewNote", NotesSchema);
