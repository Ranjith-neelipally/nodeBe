import mongoose from "mongoose";
import { MONGO_URI } from "../utils/variables";

const URI = MONGO_URI as string;
mongoose
  .connect(URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err, "connection faield");
  });
