"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Photos_1 = require("../../contoller/Photos");
const PhotosRouter = (0, express_1.Router)();
PhotosRouter.get("", Photos_1.GetPhotoDetails);
exports.default = PhotosRouter;
