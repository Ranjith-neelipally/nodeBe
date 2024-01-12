import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://winteriscoming164:Porababu.12@cluster0.qmfowsk.mongodb.net/Research-Pal"
  )
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err, "connection faield");
  });
