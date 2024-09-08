"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const variables_1 = require("../utils/variables");
const URI = variables_1.MONGO_URI;
mongoose_1.default
    .connect(URI)
    .then(() => {
    console.log("connected to db");
})
    .catch((err) => {
    console.log(err, "connection faield");
});
