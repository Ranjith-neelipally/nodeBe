import express from "express";
import "./db";
import Project from "./modals/Projects";
import NewNote from "./modals/NewNote";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("<h1>hello world</h1>");
});

app.post("/", (req, res) => {
  res.json({
    message: "hello",
  });
  console.log(req.body, "reques form");
});

app.post("/createNewProject", async (req, res) => {
  const newProject = new Project({
    projectTitle: req.body.projectTitle,
    location: req.body.location,
    replications: req.body.replications,
    treatments: req.body.treatments,
    note: [],
  });

  await newProject.save();
  res.json({
    response: "New Project Created",
  });
});

app.post("/createNewNote", async (req, res) => {
  const NewNotedetails = new NewNote({
    NoteId: req.body.NoteId,
    NoteDate: req.body.NoteId,
    Note: req.body.Note,
  });
  await NewNotedetails.save();
  res.json({
    response: "new Note Created",
  });
});

app.listen(1430, () => {
  console.log("listening");
});
./