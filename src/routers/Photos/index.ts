import { Router } from "express";
import {
  GetPhotoDetails,
  GetPhotoDevices,
  GetPhotoLibrary,
  GetPhotoSignals,
  PostPhotoSignal,
  RegisterPhotoDevice,
  StreamPhotoSignals,
  TriggerPhotoAccessNotification,
} from "../../contoller/Photos";

const PhotosRouter = Router();
PhotosRouter.get("/library", GetPhotoLibrary);
PhotosRouter.post("/devices", RegisterPhotoDevice);
PhotosRouter.get("/devices", GetPhotoDevices);
PhotosRouter.post("/access-notification", TriggerPhotoAccessNotification);
PhotosRouter.get("/signals/stream", StreamPhotoSignals);
PhotosRouter.post("/signals", PostPhotoSignal);
PhotosRouter.get("/signals", GetPhotoSignals);
PhotosRouter.get("", GetPhotoDetails);

export default PhotosRouter;
