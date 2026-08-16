import { RequestHandler } from "express";
import { Projects } from "../../modals/Projects";
import { Plots } from "../../modals/Projects/Plots";
import { ObservationSessions, ObservationTypes } from "../../modals/Projects/Observations";
import { buildProjectObservationSnapshot } from "../../services/observationAnalysis";
import { createObservationPdf, createObservationWorkbook, safeFilename } from "../../services/observationExport";
import { buildObservationComparison, ComparisonRequest } from "../../services/observationComparison";
import { compareLayout } from "../../services/observationSort";
import { createSelectedCharts } from "../../services/observationChartExport";
import { cleanupExportTempAfterResponse } from "../../utils/exportTempCleanup";

const projectFor = (projectId: string, userId: string) => Projects.findOne({ _id: projectId, userId });
const fail = (res: any, status: number, error: string) => res.status(status).json({ error });
const serializeRecord = (session: any, record: any, plot?: any, type?: any) => ({
  _id: `${session._id}:${record.plotId}`, projectId: session.projectId, plotId: record.plotId, observationTypeId: session.observationTypeId,
  value: record.value, note: record.note, capturedAt: session.capturedAt, createdAt: session.createdAt, updatedAt: session.updatedAt,
  measurementSessionId: session._id.toString(), sessionSequence: session.sequence,
  plotName: plot?.title, treatment: plot?.treatment, replication: plot?.replication,
  treatmentId: plot?.treatment != null ? String(plot.treatment) : undefined,
  replicationId: plot?.replication != null ? String(plot.replication) : undefined,
  observationName: type?.name, unit: type?.unit, dataType: type?.dataType,
});
const validValue = (dataType: string, value: unknown) => {
  if (dataType === "number") return typeof value === "number" && Number.isFinite(value);
  if (dataType === "boolean") return typeof value === "boolean";
  return typeof value === "string" && value.length <= 10000;
};
const projectType = (projectId: string, observationTypeId: string) => ObservationTypes.findOne({ _id: observationTypeId, projectId });
const nextSequence = async (projectId: string, observationTypeId: string) =>
  ((await ObservationSessions.findOne({ projectId, observationTypeId }).sort({ sequence: -1 }).select({ sequence: 1 }).lean())?.sequence || 0) + 1;
const createSession = async (projectId:string,observationTypeId:string,capturedAt:Date,records:any[]) => {
  for(let attempt=0;attempt<3;attempt++){try{return await ObservationSessions.create({projectId,observationTypeId,capturedAt,sequence:await nextSequence(projectId,observationTypeId),records})}catch(error:any){if(error?.code!==11000||attempt===2)throw error}}
  throw new Error("Unable to allocate observation session sequence");
};
const splitRecordId = (recordId: string) => { const [sessionId, plotId] = recordId.split(":"); return { sessionId, plotId }; };

export const CreateObservationType: RequestHandler = async (req, res) => {
  const userId = req.user.id; const { projectId, name, dataType, unit } = req.body;
  if (!await projectFor(projectId, userId)) return fail(res, 404, "Project not found");
  if (dataType !== "number" && unit) return fail(res, 422, "Unit is only valid for numeric observations");
  if (await ObservationTypes.findOne({ projectId, name }).collation({locale:"en",strength:2})) return fail(res, 409, "Observation name already exists in this project");
  try {
    const data = await ObservationTypes.create({ projectId, name, dataType, unit: dataType === "number" ? unit || null : null });
    return res.status(201).json({ data });
  } catch (error: any) {
    if (error?.code === 11000) return fail(res, 409, "Observation name already exists in this project");
    throw error;
  }
};
export const ListObservationTypes: RequestHandler = async (req, res) => {
  const userId = req.user.id; const { projectId } = req.body;
  if (!await projectFor(projectId, userId)) return fail(res, 404, "Project not found");
  const data = await ObservationTypes.find({ projectId }).sort({ updatedAt: -1 });
  return res.json({ data });
};
export const UpdateObservationType: RequestHandler = async (req, res) => {
  const userId = req.user.id; const { projectId, observationTypeId, name, unit } = req.body;
  const [project,type] = await Promise.all([projectFor(projectId,userId),projectType(projectId,observationTypeId)]); if (!project||!type) return fail(res, 404, "Observation type not found");
  if (name && await ObservationTypes.findOne({ projectId, name, _id: { $ne: type._id } }).collation({locale:"en",strength:2})) return fail(res, 409, "Observation name already exists in this project");
  const update: any = {}; if (typeof name === "string") update.name = name; if (type.dataType === "number" && typeof unit !== "undefined") update.unit = unit || null;
  const data = await ObservationTypes.findOneAndUpdate({ _id: type._id, projectId }, { $set: update }, { new: true }); return res.json({ data });
};
export const DeleteObservationType: RequestHandler = async (req, res) => {
  const userId = req.user.id; const { projectId, observationTypeId } = req.body;
  const [project,type] = await Promise.all([projectFor(projectId,userId),projectType(projectId,observationTypeId)]); if (!project||!type) return fail(res, 404, "Observation type not found");
  if (await ObservationSessions.exists({ projectId, observationTypeId, "records.0": { $exists: true } })) return fail(res, 409, "Observation type has records and cannot be deleted");
  await Promise.all([ObservationTypes.deleteOne({ _id: type._id, projectId }),ObservationSessions.deleteMany({projectId,observationTypeId:type._id})]); return res.json({ message: "Observation type deleted" });
};

const validateContext = async (projectId: string, observationTypeId: string, plotIds: string[], userId: string) => {
  const [project, type, plots] = await Promise.all([projectFor(projectId, userId), projectType(projectId, observationTypeId), Plots.find({ _id: { $in: plotIds }, projectId, userId })]);
  return { project, type, plots, valid: Boolean(project && type && plots.length === new Set(plotIds).size) };
};
export const CreateObservationRecord: RequestHandler = async (req, res) => {
  const userId = req.user.id; const { projectId, plotId, observationTypeId, value, note, capturedAt } = req.body;
  const context = await validateContext(projectId, observationTypeId, [plotId], userId); if (!context.valid) return fail(res, 422, "Project, plot, or observation type mismatch");
  if (!validValue(context.type!.dataType, value)) return fail(res, 422, `Invalid ${context.type!.dataType} value`);
  const captured=new Date(capturedAt||Date.now());const session=await createSession(projectId,observationTypeId,captured,[{plotId,value,note:note||null}]);
  return res.status(201).json({ data: serializeRecord(session, session.records[0], context.plots[0], context.type) });
};
export const BulkCreateObservationRecords: RequestHandler = async (req, res) => {
  const userId = req.user.id; const { projectId, observationTypeId, records } = req.body; const plotIds = records.map((x: any) => x.plotId);
  if (new Set(plotIds).size !== plotIds.length) return fail(res, 422, "Bulk capture contains duplicate plots");
  const context = await validateContext(projectId, observationTypeId, plotIds, userId); if (!context.valid) return fail(res, 422, "Bulk capture contains a plot or observation type outside this project");
  if (records.some((x: any) => !validValue(context.type!.dataType, x.value))) return fail(res, 422, `Bulk capture contains an invalid ${context.type!.dataType} value`);
  const sessionCapturedAt=new Date(records[0]?.capturedAt||Date.now());const session=await createSession(projectId,observationTypeId,sessionCapturedAt,records.map((x:any)=>({plotId:x.plotId,value:x.value,note:x.note||null})));
  const pm=new Map(context.plots.map((plot:any)=>[plot._id.toString(),plot]));const data=session.records.map((record:any)=>serializeRecord(session,record,pm.get(record.plotId.toString()),context.type));
  return res.status(201).json({ data });
};
export const ListObservationRecords: RequestHandler = async (req, res) => {
  const userId = req.user.id; const { projectId, observationTypeId, plotId } = req.body;
  if (!await projectFor(projectId, userId)) return fail(res, 404, "Project not found");
  if (observationTypeId && !await projectType(projectId, observationTypeId)) return fail(res, 404, "Observation type not found");
  const query: any = { projectId }; if (observationTypeId) query.observationTypeId = observationTypeId; if (plotId) query["records.plotId"] = plotId;
  const sessions = await ObservationSessions.find(query).sort({ capturedAt: -1 }).lean();
  const plotIds=sessions.flatMap((s:any)=>s.records.map((r:any)=>r.plotId));const typeIds=sessions.map((s:any)=>s.observationTypeId);
  const [plots, types] = await Promise.all([Plots.find({ _id: { $in: plotIds }, projectId, userId }), ObservationTypes.find({ _id: { $in: typeIds }, projectId })]);
  const pm = new Map(plots.map(x => [x._id.toString(), x])); const tm = new Map(types.map(x => [x._id.toString(), x]));
  const data=sessions.flatMap((session:any)=>session.records.filter((record:any)=>!plotId||record.plotId.toString()===plotId).map((record:any)=>serializeRecord(session,record,pm.get(record.plotId.toString()),tm.get(session.observationTypeId.toString())))).sort((a:any,b:any)=>compareLayout({plotId:String(a.plotId),treatmentId:a.treatmentId,replicationId:a.replicationId},{plotId:String(b.plotId),treatmentId:b.treatmentId,replicationId:b.replicationId},"replication"));
  return res.json({ data });
};
export const UpdateObservationRecord: RequestHandler = async (req, res) => {
  const userId = req.user.id; const { projectId, recordId, value, note, capturedAt } = req.body; if (!await projectFor(projectId,userId)) return fail(res,404,"Project not found");
  const {sessionId,plotId}=splitRecordId(recordId);const session=await ObservationSessions.findOne({_id:sessionId,projectId,"records.plotId":plotId});if(!session)return fail(res,404,"Observation record not found");
  const type = await ObservationTypes.findOne({_id:session.observationTypeId,projectId}); if (!type) return fail(res, 409, "Observation type no longer exists");
  if (typeof value !== "undefined" && !validValue(type.dataType, value)) return fail(res, 422, `Invalid ${type.dataType} value`);
  const set:any={};if(typeof value!=="undefined")set["records.$.value"]=value;if(typeof note!=="undefined")set["records.$.note"]=note||null;if(capturedAt)set.capturedAt=capturedAt;
  const updated=await ObservationSessions.findOneAndUpdate({_id:sessionId,projectId,"records.plotId":plotId},{$set:set},{new:true});const record=updated!.records.find((x:any)=>x.plotId.toString()===plotId);return res.json({data:serializeRecord(updated,record)});
};
export const DeleteObservationRecord: RequestHandler = async (req, res) => {
  const { projectId, recordId } = req.body;if(!await projectFor(projectId,req.user.id))return fail(res,404,"Project not found");const{sessionId,plotId}=splitRecordId(recordId);const result=await ObservationSessions.findOneAndUpdate({_id:sessionId,projectId,"records.plotId":plotId},{$pull:{records:{plotId}}},{new:true});
  if(!result)return fail(res,404,"Observation record not found");if(!result.records.length)await ObservationSessions.deleteOne({_id:result._id,projectId});return res.json({ message: "Observation record deleted" });
};

export const GetObservationSummary: RequestHandler = async (req, res) => {
  const { projectId, observationTypeId } = req.body; const snapshot = await buildProjectObservationSnapshot(projectId, req.user.id, observationTypeId); const analysis=snapshot?.analyses[0]; if (!analysis) return fail(res, 422, "Numeric observation type not found");
  return res.json({ data: analysis.summary });
};
export const GetObservationGraphs: RequestHandler = async (req, res) => {
  const { projectId, observationTypeId } = req.body; const snapshot = await buildProjectObservationSnapshot(projectId, req.user.id, observationTypeId); const analysis=snapshot?.analyses[0]; if (!analysis) return fail(res, 422, "Numeric observation type not found");
  return res.json({ data: { sessions:analysis.sessions, treatmentSeries:analysis.treatmentSeries, timeSeries:analysis.timeSeries } });
};
export const CompareObservationData:RequestHandler=async(req,res)=>{const{projectId,observationTypeId,...request}=req.body;const snapshot=await buildProjectObservationSnapshot(projectId,req.user.id,observationTypeId);if(!snapshot)return fail(res,404,"Project or observation type not found");const data=buildObservationComparison(snapshot,observationTypeId,request);if(!data)return fail(res,422,"Numeric observation type required");return res.json({data})};
const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
export const ExportObservations: RequestHandler = async (req, res) => {
  const { projectId, observationTypeId, format="csv", comparison:comparisonJson } = req.body; const snapshot=await buildProjectObservationSnapshot(projectId,req.user.id,observationTypeId);if(!snapshot)return fail(res,404,"Project or observation type not found");const name=safeFilename(String(snapshot.project.title));let comparison:any=null;if(comparisonJson&&observationTypeId){try{comparison=buildObservationComparison(snapshot,observationTypeId,JSON.parse(comparisonJson) as ComparisonRequest)}catch{return fail(res,422,"Invalid comparison export configuration")}}
  cleanupExportTempAfterResponse(res);
  if(format==="xlsx"){const file=await createObservationWorkbook(snapshot,comparison);res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");res.setHeader("Content-Disposition",`attachment; filename="${name}-observations.xlsx"`);return res.send(file)}
  if(format==="pdf"){const file=await createObservationPdf(snapshot,comparison);res.setHeader("Content-Type","application/pdf");res.setHeader("Content-Disposition",`attachment; filename="${name}-observation-report.pdf"`);return res.send(file)}
  const rows=[["Date","Time","Round","Session ID","Plot ID","Plot Name","Treatment ID","Treatment Name","Replication ID","Replication Name","Observation","Value","Unit","Note"],...snapshot.rawRows.map(row=>[row.date.toISOString().slice(0,10),row.date.toISOString().slice(11,19),row.round,row.measurementSessionId,row.plotId,row.plot,row.treatmentId,row.treatment,row.replicationId,row.replication,row.observation,row.value,row.unit,row.note])];const csv="\ufeff"+rows.map(row=>row.map(csvCell).join(",")).join("\r\n");res.setHeader("Content-Type","text/csv; charset=utf-8");res.setHeader("Content-Disposition",`attachment; filename="${name}-observations.csv"`);return res.send(csv);
};
export const ExportCharts:RequestHandler=async(req,res)=>{const{projectId,format,charts}=req.body;const project=await projectFor(projectId,req.user.id);if(!project)return fail(res,404,"Project not found");cleanupExportTempAfterResponse(res);const file=await createSelectedCharts(charts,format);res.setHeader("Content-Type",format==="png"?"image/png":format==="pdf"?"application/pdf":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");res.setHeader("Content-Disposition",`attachment; filename="${safeFilename(String(project.title))}-charts.${format}"`);return res.send(file)};
