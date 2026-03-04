import * as yup from "yup";
import { isValidObjectId } from "mongoose";

export const CreateProjectSchema = yup.object().shape({
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),

  title: yup
    .string()
    .trim()
    .required("Project title is required")
    .max(100, "Project title is too long"),

  plotsCount: yup
    .number()
    .nullable()
    .notRequired()
    .typeError("Plots count must be a number"),

  replications: yup.number().required("Replications count is required"),

  treatments: yup.number().required("Treatments count is required"),

  location: yup
    .string()
    .trim()
    .notRequired()
    .typeError("Location must be a string")
    .max(200, "Location is too long"),
});

export const CreatePlotSchema = yup.object().shape({
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
  projectId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("ProjectId is invalid or missing."),
  plots: yup
    .array()
    .of(
      yup.object().shape({
        title: yup
          .string()
          .trim()
          .required("Plot title is required")
          .max(100, "Plot title is too long"),
        color: yup
          .string()
          .trim()
          .required("Plot color is required")
          .max(50, "Plot color is too long"),
        notesCount: yup
          .number()
          .nullable()
          .notRequired()
          .typeError("Notes count must be a number"),
        replication: yup.number().required("Replication number is required"),
        treatment: yup.number().required("Treatment number is required"),
        plotIndex: yup
          .array()
          .of(yup.number().required())
          .required("plotIndex is required"),
      }),
    )
    .min(1, "At least one plot is required")
    .required("Plots array is required"),
});

export const CreateNoteSchema2 = yup.object().shape({
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
  projectId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("ProjectId is invalid or missing."),
  plotId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("PlotId is invalid or missing."),
  content: yup
    .string()
    .trim()
    .required("Note content is required")
    .max(2000, "Note content is too long"),
  photoIds: yup.array().of(yup.string()).notRequired(),
});
export const CreateNoteSchema = yup.object().shape({
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) return value;
      return "";
    })
    .required("UserId is invalid or missing."),

  projectId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) return value;
      return "";
    })
    .required("ProjectId is invalid or missing."),

  plotId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) return value;
      return "";
    })
    .required("PlotId is invalid or missing."),

  title: yup.string().optional(),
  ProjectTitle: yup.string().optional(),
  replication: yup.number().optional(),
  treatment: yup.number().optional(),

  content: yup
    .array()
    .of(
      yup.object({
        note: yup
          .string()
          .trim()
          .max(2000, "Note content is too long")
          .notRequired(),
        photoIds: yup.array().of(yup.string()).notRequired(),
      }),
    )
    .required("At least one note is required"),
});

export const EditProjectSchema = yup.object().shape({
  _id: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("Project id is invalid or missing."),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
  title: yup
    .string()
    .trim()
    .notRequired()
    .typeError("Title must be a string")
    .max(100, "Project title is too long"),
  replications: yup
    .number()
    .notRequired()
    .typeError("Replications count must be a number"),
  treatments: yup
    .number()
    .notRequired()
    .typeError("Treatments count must be a number"),
  location: yup
    .string()
    .trim()
    .notRequired()
    .typeError("Location must be a string")
    .max(200, "Location is too long"),
});

export const EditPlotSchema = yup.object().shape({
  _id: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("Plot id is invalid or missing."),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
  projectId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("ProjectId is invalid or missing."),
  title: yup
    .string()
    .trim()
    .notRequired()
    .typeError("Title must be a string")
    .max(100, "Plot title is too long"),
  color: yup
    .string()
    .trim()
    .notRequired()
    .typeError("Color must be a string")
    .max(50, "Plot color is too long"),
  notesCount: yup
    .number()
    .notRequired()
    .typeError("Notes count must be a number"),
  replication: yup
    .number()
    .notRequired()
    .typeError("Replication number must be a number"),
  treatment: yup
    .number()
    .notRequired()
    .typeError("Treatment number must be a number"),
});

export const EditNoteSchema = yup
  .object()
  .shape({
    noteId: yup
      .string()
      .transform(function (value) {
        if (this.isType(value) && isValidObjectId(value)) return value;
        return "";
      })
      .required("Note id is invalid or missing."),

    userId: yup
      .string()
      .transform(function (value) {
        if (this.isType(value) && isValidObjectId(value)) return value;
        return "";
      })
      .required("UserId is invalid or missing."),

    projectId: yup
      .string()
      .transform(function (value) {
        if (this.isType(value) && isValidObjectId(value)) return value;
        return "";
      })
      .required("ProjectId is invalid or missing."),

    plotId: yup
      .string()
      .transform(function (value) {
        if (this.isType(value) && isValidObjectId(value)) return value;
        return "";
      })
      .required("PlotId is invalid or missing."),

    note: yup
      .string()
      .trim()
      .notRequired()
      .typeError("Note content must be a string")
      .max(2000, "Note content is too long"),

    photoIds: yup.array().of(yup.string().strict(true)).notRequired(),
  })
  .test(
    "at-least-one-field",
    "Either content or photoIds must be provided",
    function (value) {
      const hasContent =
        typeof value?.note === "string" && value.note.trim().length > 0;

      const hasPhotos =
        Array.isArray(value?.photoIds) && value.photoIds.length > 0;

      return hasContent || hasPhotos;
    },
  );

export const DeleteProjectSchema = yup.object().shape({
  _id: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("Project id is invalid or missing."),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
});

export const DeletePlotSchema = yup.object().shape({
  _id: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("Plot id is invalid or missing."),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
  projectId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("ProjectId is invalid or missing."),
});

export const DeleteNoteSchema = yup.object().shape({
  _id: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("Note id is invalid or missing."),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
  projectId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("ProjectId is invalid or missing."),
  plotId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("PlotId is invalid or missing."),
});

export const GetAllProjectsSchema = yup.object().shape({
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("UserId is invalid or missing."),
});

export const GetAllPlotsSchema = yup.object().shape({
  userId: yup.string().transform(function (value) {
    if (this.isType(value) && isValidObjectId(value)) {
      return value;
    }
    return "";
  }),
  projectId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("ProjectId is invalid or missing."),
});

export const GetNoteSchema = yup.object().shape({
  userId: yup.string().transform(function (value) {
    if (this.isType(value) && isValidObjectId(value)) {
      return value;
    }
    return "";
  }),
  projectId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return "";
    })
    .required("ProjectId is invalid or missing."),
  plotId: yup.string().transform(function (value) {
    if (this.isType(value) && isValidObjectId(value)) {
      return value;
    }
    return "";
  }),
});
