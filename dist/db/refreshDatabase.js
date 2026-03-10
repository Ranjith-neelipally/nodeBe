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
const express_1 = require("express");
const Projects_1 = require("../modals/Projects");
const Plots_1 = require("../modals/Projects/Plots");
const Notes_1 = require("../modals/Projects/Notes");
const Idea_1 = __importDefault(require("../modals/Idea"));
const userModal_1 = __importDefault(require("../modals/userModal"));
const resetPassword_1 = __importDefault(require("../modals/resetPassword"));
const userVerification_1 = __importDefault(require("../modals/userVerification"));
const Treatments_1 = __importDefault(require("../modals/Treatments"));
const router = (0, express_1.Router)();
const modalUpdates = [
    {
        model: Projects_1.Projects,
        update: {},
    },
    {
        model: Treatments_1.default,
        update: {},
    },
    {
        model: Plots_1.Plots,
        update: {},
    },
    {
        model: Notes_1.PlotNotes,
        update: { photoIds: [] },
    },
    {
        model: Idea_1.default,
        update: {},
    },
    {
        model: userModal_1.default,
        update: { bio: "", profilePhotoUrl: "" },
    },
    {
        model: resetPassword_1.default,
        update: {},
    },
    {
        model: userVerification_1.default,
        update: {},
    },
];
router.post("/refresh-modals", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (const { model, update } of modalUpdates) {
            if (Object.keys(update).length > 0) {
                yield model.updateMany(Object.fromEntries(Object.keys(update).map((k) => [k, { $exists: false }])), { $set: update });
            }
        }
        res.json({ success: true, message: "All modals refreshed." });
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        res.status(500).json({ success: false, error: errorMessage });
    }
}));
exports.default = router;
