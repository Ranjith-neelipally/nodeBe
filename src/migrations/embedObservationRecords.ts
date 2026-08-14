import "dotenv/config";
import mongoose, { Types } from "mongoose";
import dbConnect from "../db";

type LegacyRecord={_id:Types.ObjectId;projectId:Types.ObjectId;observationTypeId:Types.ObjectId;plotId:Types.ObjectId;measurementSessionId?:Types.ObjectId|null;value:unknown;note?:string|null;capturedAt:Date};
type Group={sessionId?:Types.ObjectId;projectId:Types.ObjectId;observationTypeId:Types.ObjectId;capturedAt:Date;records:LegacyRecord[]};
const key=(value:unknown)=>String(value);
const embedded=(records:LegacyRecord[])=>records.map(r=>({plotId:r.plotId,value:r.value,note:r.note||null}));
const sameRecords=(left:any[],right:any[])=>left.length===right.length&&left.every((item,index)=>key(item.plotId)===key(right[index].plotId)&&JSON.stringify(item.value)===JSON.stringify(right[index].value)&&(item.note||null)===(right[index].note||null));

function groupUnassigned(records:LegacyRecord[]):Group[]{
  const sorted=[...records].sort((a,b)=>key(a.observationTypeId).localeCompare(key(b.observationTypeId))||+new Date(a.capturedAt)-+new Date(b.capturedAt)||key(a._id).localeCompare(key(b._id)));
  const groups:Group[]=[];let current:LegacyRecord[]=[];let lastType="",lastProject="",lastTime=0,plots=new Set<string>();
  const flush=()=>{if(current.length){groups.push({projectId:current[0].projectId,observationTypeId:current[0].observationTypeId,capturedAt:current[0].capturedAt,records:current});current=[];plots=new Set()}};
  for(const record of sorted){const type=key(record.observationTypeId),project=key(record.projectId),time=+new Date(record.capturedAt),plot=key(record.plotId);if(type!==lastType||project!==lastProject||time-lastTime>5*60*1000||plots.has(plot))flush();current.push(record);plots.add(plot);lastType=type;lastProject=project;lastTime=time}flush();return groups;
}

export async function migrateObservationRecords(apply=false){
  await dbConnect();const db=mongoose.connection.db;if(!db)throw new Error("Database not connected");
  const legacy=db.collection<LegacyRecord>("observationrecords"),sessions=db.collection("observationsessions"),types=db.collection("observationtypes");
  const legacyRecords=await legacy.find({}).sort({projectId:1,observationTypeId:1,capturedAt:1,_id:1}).toArray();
  const existingSessions=await sessions.find({}).sort({projectId:1,observationTypeId:1,capturedAt:1,_id:1}).toArray(),sessionMap=new Map(existingSessions.map(s=>[key(s._id),s]));
  const assigned=new Map<string,LegacyRecord[]>(),unassigned:LegacyRecord[]=[];
  for(const record of legacyRecords){if(record.measurementSessionId){const session=sessionMap.get(key(record.measurementSessionId));if(!session||key(session.projectId)!==key(record.projectId)||key(session.observationTypeId)!==key(record.observationTypeId))throw new Error(`Cannot prove session mapping for record ${record._id}`);assigned.set(key(record.measurementSessionId),[...(assigned.get(key(record.measurementSessionId))||[]),record])}else unassigned.push(record)}
  const assignedGroups:Group[]=[...assigned].map(([sessionId,records])=>({sessionId:new Types.ObjectId(sessionId),projectId:records[0].projectId,observationTypeId:records[0].observationTypeId,capturedAt:records[0].capturedAt,records}));
  const groups:Group[]=[...assignedGroups,...groupUnassigned(unassigned)];
  const sequenceByType=new Map<string,number>(),sessionSequences=new Map<string,number>();for(const session of existingSessions){const groupKey=`${session.projectId}:${session.observationTypeId}`,sequence=(sequenceByType.get(groupKey)||0)+1;sequenceByType.set(groupKey,sequence);sessionSequences.set(key(session._id),sequence)}
  if(apply){
    if(existingSessions.length)await sessions.bulkWrite(existingSessions.map(session=>({updateOne:{filter:{_id:session._id},update:{$set:{sequence:sessionSequences.get(key(session._id))}}}})));
    for(const group of groups){const groupKey=`${group.projectId}:${group.observationTypeId}`;let sessionId=group.sessionId;if(sessionId){await sessions.updateOne({_id:sessionId},{$set:{sequence:sessionSequences.get(key(sessionId)),records:embedded(group.records)},$unset:{userId:"",source:"",serverVersion:"",lastModifiedByDeviceId:"",createdOfflineAt:"",syncStatus:"",syncedAt:""}})}else{const sequence=(sequenceByType.get(groupKey)||0)+1;sequenceByType.set(groupKey,sequence);const created=await sessions.insertOne({projectId:group.projectId,observationTypeId:group.observationTypeId,capturedAt:group.capturedAt,sequence,records:embedded(group.records),createdAt:new Date(),updatedAt:new Date()});sessionId=created.insertedId}
      const verified=await sessions.findOne({_id:sessionId});if(!verified||!sameRecords(verified.records||[],embedded(group.records)))throw new Error(`Verification failed for session ${sessionId}`);
      await legacy.deleteMany({_id:{$in:group.records.map(r=>r._id)}});
    }
    await sessions.updateMany({},{$unset:{userId:"",source:"",serverVersion:"",lastModifiedByDeviceId:"",createdOfflineAt:"",syncStatus:"",syncedAt:""}});
    const allTypes=await types.find({}).toArray();for(const type of allTypes)await types.updateOne({_id:type._id},{$unset:{userId:"",serverVersion:"",lastModifiedByDeviceId:"",createdOfflineAt:"",syncStatus:"",syncedAt:""}});
    const remaining=await legacy.countDocuments();if(remaining)throw new Error(`${remaining} legacy records remain; collection retained`);await legacy.drop().catch(error=>{if(error?.codeName!=="NamespaceNotFound")throw error});
  }
  return{mode:apply?"applied":"dry-run",legacyRecords:legacyRecords.length,existingSessionGroups:assigned.size,inferredSessionGroups:groups.length-assigned.size,verifiedForMigration:groups.reduce((sum,g)=>sum+g.records.length,0)};
}

if(require.main===module)migrateObservationRecords(process.argv.includes("--apply")).then(result=>{console.log(JSON.stringify(result,null,2));return mongoose.disconnect()}).catch(async error=>{console.error(error);await mongoose.disconnect();process.exitCode=1});
