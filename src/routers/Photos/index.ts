import { Router } from "express";
import { GetPhotoDetails } from "../../contoller/Photos";

const PhotosRouter = Router();
PhotosRouter.get("", GetPhotoDetails);

export default PhotosRouter;
