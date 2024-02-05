import { Schema, model } from "mongoose";

export interface ProjectDetailsInterface {
  projects?: Array<{
    projectTitle?: string;
    location?: string;
    replications?: number;
    treatments?: number;
  }>;
  userMail?: string;
}

const ProjectsCollectionSChems = new Schema({
  projectTitle: {
    type: String,
  },
  location: {
    type: String,
  },
  replications: {
    type: Number,
  },
  treatments: {
    type: Number,
  },
});

const ProjectSchema = new Schema({
  userMail: {
    type: String,
    required: false,
    trim: true,
  },
  projects: {
    type: [ProjectsCollectionSChems],
    required: true,
    trim: true,
  },
});

export default model("Project", ProjectSchema);
