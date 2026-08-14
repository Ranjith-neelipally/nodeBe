import * as yup from "yup";

const id = yup.string().matches(/^[a-f\d]{24}$/i, "Invalid resource id").required();
const embeddedRecordId = yup.string().matches(/^[a-f\d]{24}:[a-f\d]{24}$/i, "Invalid observation record id").required();
const value = yup.mixed().required("Value is required");
export const CreateObservationTypeSchema = yup.object({ projectId: id, name: yup.string().trim().max(100).required(), dataType: yup.string().oneOf(["number", "text", "boolean"]).required(), unit: yup.string().trim().max(40).nullable().optional() });
export const UpdateObservationTypeSchema = yup.object({ projectId: id, observationTypeId: id, name: yup.string().trim().max(100).optional(), unit: yup.string().trim().max(40).nullable().optional() });
export const ObservationTypeQuerySchema = yup.object({ projectId: id, observationTypeId: id.optional() });
export const DeleteObservationTypeSchema = yup.object({ projectId: id, observationTypeId: id });
export const CreateObservationRecordSchema = yup.object({ projectId: id, plotId: id, observationTypeId: id, value, note: yup.string().trim().max(2000).nullable().optional(), capturedAt: yup.date().optional() });
export const BulkObservationRecordsSchema = yup.object({ projectId: id, observationTypeId: id, records: yup.array().of(yup.object({ plotId: id, value, note: yup.string().trim().max(2000).nullable().optional(), capturedAt: yup.date().optional() })).min(1).required() });
export const ObservationRecordsQuerySchema = yup.object({ projectId: id, observationTypeId: id.optional(), plotId: id.optional() });
export const UpdateObservationRecordSchema = yup.object({ projectId: id, recordId: embeddedRecordId, value: yup.mixed().optional(), note: yup.string().trim().max(2000).nullable().optional(), capturedAt: yup.date().optional() });
export const DeleteObservationRecordSchema = yup.object({ projectId: id, recordId: embeddedRecordId });
export const ObservationAnalyticsQuerySchema = yup.object({ projectId: id, observationTypeId: id });
export const ObservationComparisonSchema = yup.object({ projectId:id, observationTypeId:id, mode:yup.string().oneOf(["specificDates","dateRange","sessions","time"]).required(), selectedDates:yup.array().of(yup.string().matches(/^\d{4}-\d{2}-\d{2}$/)).optional(), from:yup.string().matches(/^\d{4}-\d{2}-\d{2}$/).optional(), to:yup.string().matches(/^\d{4}-\d{2}-\d{2}$/).optional(), sessionIds:yup.array().of(id).optional(), timeFrom:yup.string().matches(/^\d{2}:\d{2}$/).optional(), timeTo:yup.string().matches(/^\d{2}:\d{2}$/).optional(), selectedPlots:yup.array().of(id).optional(), selectedTreatments:yup.array().of(yup.string()).optional(), groupBy:yup.string().oneOf(["plot","treatment"]).default("plot"), aggregation:yup.string().oneOf(["average","minimum","maximum","growth","minMax","daily"]).default("average") });
export const ObservationExportQuerySchema = yup.object({ projectId: id, observationTypeId: id.optional(), format: yup.string().oneOf(["csv", "xlsx", "pdf"]).default("csv"), comparison:yup.string().optional() });
export const ChartExportSchema=yup.object({projectId:id,format:yup.string().oneOf(["png","pdf","xlsx"]).required(),charts:yup.array().of(yup.object({title:yup.string().max(200).required(),subtitle:yup.string().max(500).optional(),svg:yup.string().required(),columns:yup.array().of(yup.string().required()).required(),rows:yup.array().of(yup.array().of(yup.mixed().nullable())).required()})).min(1).required()});
