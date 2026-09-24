import { Router } from "express";
import { DeletePhoto, FetchPhotoVariant, GetPhotoDetails, GetPhotoLibrary, UploadPhoto } from "../../contoller/Photos";

const PhotosRouter = Router();
PhotosRouter.get("/library", GetPhotoLibrary);
PhotosRouter.post("/upload", UploadPhoto);
PhotosRouter.get("/:photoId/:variant", FetchPhotoVariant);
PhotosRouter.delete("/:photoId", DeletePhoto);
PhotosRouter.get("", GetPhotoDetails);
export default PhotosRouter;
