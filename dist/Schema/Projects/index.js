"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNoteSchema = exports.GetAllPlotsSchema = exports.GetAllProjectsSchema = exports.DeleteNoteSchema = exports.DeletePlotSchema = exports.DeleteProjectSchema = exports.EditNoteSchema = exports.EditPlotSchema = exports.EditProjectSchema = exports.CreateNoteSchema = exports.CreateNoteSchema2 = exports.CreatePlotSchema = exports.CreateProjectSchema = void 0;
const yup = __importStar(require("yup"));
const mongoose_1 = require("mongoose");
exports.CreateProjectSchema = yup.object().shape({
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
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
exports.CreatePlotSchema = yup.object().shape({
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("UserId is invalid or missing."),
    projectId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("ProjectId is invalid or missing."),
    plots: yup
        .array()
        .of(yup.object().shape({
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
    }))
        .min(4, "At least 4 plots (e.g. 2x2 matrix) are required")
        .required("Plots array is required"),
});
exports.CreateNoteSchema2 = yup.object().shape({
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("UserId is invalid or missing."),
    projectId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("ProjectId is invalid or missing."),
    plotId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
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
exports.CreateNoteSchema = yup.object().shape({
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value))
            return value;
        return "";
    })
        .required("UserId is invalid or missing."),
    projectId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value))
            return value;
        return "";
    })
        .required("ProjectId is invalid or missing."),
    plotId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value))
            return value;
        return "";
    })
        .required("PlotId is invalid or missing."),
    title: yup.string().optional(),
    ProjectTitle: yup.string().optional(),
    replication: yup.number().optional(),
    treatment: yup.number().optional(),
    content: yup
        .array()
        .of(yup.string())
        .required("At least one note is required"),
    photoIds: yup.array().of(yup.string()).notRequired(),
});
exports.EditProjectSchema = yup.object().shape({
    _id: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("Project id is invalid or missing."),
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
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
exports.EditPlotSchema = yup.object().shape({
    _id: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("Plot id is invalid or missing."),
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("UserId is invalid or missing."),
    projectId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
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
exports.EditNoteSchema = yup
    .object()
    .shape({
    noteId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value))
            return value;
        return "";
    })
        .required("Note id is invalid or missing."),
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value))
            return value;
        return "";
    })
        .required("UserId is invalid or missing."),
    projectId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value))
            return value;
        return "";
    })
        .required("ProjectId is invalid or missing."),
    plotId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value))
            return value;
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
    .test("at-least-one-field", "Either content or photoIds must be provided", function (value) {
    const hasContent = typeof (value === null || value === void 0 ? void 0 : value.note) === "string" && value.note.trim().length > 0;
    const hasPhotos = Array.isArray(value === null || value === void 0 ? void 0 : value.photoIds) && value.photoIds.length > 0;
    return hasContent || hasPhotos;
});
exports.DeleteProjectSchema = yup.object().shape({
    _id: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("Project id is invalid or missing."),
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("UserId is invalid or missing."),
});
exports.DeletePlotSchema = yup.object().shape({
    _id: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("Plot id is invalid or missing."),
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("UserId is invalid or missing."),
    projectId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("ProjectId is invalid or missing."),
});
exports.DeleteNoteSchema = yup.object().shape({
    _id: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("Note id is invalid or missing."),
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("UserId is invalid or missing."),
    projectId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("ProjectId is invalid or missing."),
    plotId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("PlotId is invalid or missing."),
});
exports.GetAllProjectsSchema = yup.object().shape({
    userId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("UserId is invalid or missing."),
});
exports.GetAllPlotsSchema = yup.object().shape({
    userId: yup.string().transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    }),
    projectId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("ProjectId is invalid or missing."),
});
exports.GetNoteSchema = yup.object().shape({
    userId: yup.string().transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    }),
    projectId: yup
        .string()
        .transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    })
        .required("ProjectId is invalid or missing."),
    plotId: yup.string().transform(function (value) {
        if (this.isType(value) && (0, mongoose_1.isValidObjectId)(value)) {
            return value;
        }
        return "";
    }),
});
