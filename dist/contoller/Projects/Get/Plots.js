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
exports.GetAllPlots = void 0;
const Plots_1 = require("../../../modals/Projects/Plots");
const GetAllPlots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, projectId } = req.query;
    try {
        const plots = yield Plots_1.Plots.find({ userId: userId, projectId: projectId });
        res.status(200).json({ data: plots });
    }
    catch (error) { }
});
exports.GetAllPlots = GetAllPlots;
