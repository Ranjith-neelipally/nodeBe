import * as yup from "yup";
import { isValidObjectId } from "mongoose";

export const CreateProjectSchema = yup.object().shape({
  userId: yup.string().notRequired(),

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
  userId: yup.string().notRequired(),
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
  userId: yup.string().notRequired(),
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
  userId: yup.string().notRequired(),

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
    .mixed()
    .transform((value) => {
      if (typeof value === 'string') return [value];
      if (Array.isArray(value)) return value;
      return [''];
    })
    .required("At least one note is required"),

  photoIds: yup.array().of(yup.string()).optional(),
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
  userId: yup.string().notRequired(),
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
  userId: yup.string().notRequired(),
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
    .required("Plot title is required")
    .typeError("Title must be a string")
    .max(100, "Plot title is too long"),
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

    userId: yup.string().notRequired(),

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

    content: yup
      .array()
      .of(yup.string().trim())
      .notRequired()
      .typeError("Content must be an array of strings")
      .max(2000, "Note content is too long"),

    photoIds: yup.array().of(yup.string()).notRequired(),

    title: yup.string().notRequired(),
  })
  .test(
    "at-least-one-field",
    "Either content, photoIds, or title must be provided",
    function (value) {
      const hasContent =
        Array.isArray(value?.content) && value.content.length > 0;

      const hasPhotos = Array.isArray(value?.photoIds);
      const hasTitle = typeof value?.title === "string";

      return hasContent || hasPhotos || hasTitle;
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
  userId: yup.string().notRequired(),
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
  userId: yup.string().notRequired(),
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
  userId: yup.string().notRequired(),
});

export const CheckProjectTitleExistsSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required("Project title is required")
    .max(100, "Project title is too long"),
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
  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .notRequired(),
  limit: yup
    .number()
    .min(1, "Limit must be at least 1.")
    .max(100, "Limit cannot exceed 100.")
    .notRequired(),
  page: yup.number().min(1, "Page must be at least 1.").notRequired(),
});
