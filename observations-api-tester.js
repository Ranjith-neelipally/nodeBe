const http = require("http");
const assert = require("assert");
const fs = require("fs");
require("dotenv").config();
const dbConnect = require("./dist/db").default;
const User = require("./dist/modals/userModal").default;
const base = process.env.TEST_API_URL || "http://127.0.0.1:1430";
let token = "";
const request = (method, path, body) => new Promise((resolve, reject) => {
  const url = new URL(path, base); const payload=body?JSON.stringify(body):null; const req = http.request(url, { method, headers: { "Content-Type": "application/json", ...(payload?{"Content-Length":Buffer.byteLength(payload)}:{}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } }, res => { const chunks=[];res.on("data",x=>chunks.push(x));res.on("end",()=>{const raw=Buffer.concat(chunks);const text=raw.toString();let data=text;try{data=JSON.parse(text)}catch{}resolve({status:res.statusCode,data,raw,headers:res.headers})}) });req.on("error",reject);if(payload)req.write(payload);req.end();
});
const ok = (r, status, label) => assert.equal(r.status, status, `${label}: ${r.status} ${JSON.stringify(r.data)}`);
(async()=>{
  await dbConnect(); const password="ObservationTest@123"; const email=`observation-test-${Date.now()}@example.com`; const testUser=await User.create({userName:"Observation Test",email,password,verified:true,ProjectIds:[],refreshTokens:[]});
  try {
  let r=await request("POST","/auth/sign-in",{email,password});ok(r,200,"login");token=r.data.data.token;
  r=await request("POST","/projects",{title:`Observation integration ${Date.now()}`,replications:2,treatments:2,plotsCount:4,location:"Test"});ok(r,201,"create project");const projectId=r.data.data._id;
  r=await request("POST","/projects/plot",{projectId,plots:[1,2,3,4].map((n,i)=>({title:`P${n}`,color:"170 60% 50%",notesCount:0,replication:Math.floor(i/2)+1,treatment:i%2+1,plotIndex:[Math.floor(i/2),i%2]}))});assert([200,201].includes(r.status),`plots: ${JSON.stringify(r.data)}`);
  r=await request("GET",`/projects/plot?projectId=${projectId}`);ok(r,200,"list plots");const plots=r.data.data;
  r=await request("POST","/observations/types",{projectId,name:"Plant Height",dataType:"number",unit:"cm"});ok(r,201,"create type");const observationTypeId=r.data.data._id;
  r=await request("POST","/observations/records/bulk",{projectId,observationTypeId,records:plots.slice(0,3).map((p,i)=>({plotId:p._id,value:1,note:i===0?"baseline":undefined,capturedAt:"2026-08-13T09:00:00.000Z"}))});ok(r,201,"round one");
  r=await request("POST","/observations/records/bulk",{projectId,observationTypeId,records:plots.slice(0,3).map(p=>({plotId:p._id,value:2,capturedAt:"2026-08-13T11:00:00.000Z"}))});ok(r,201,"round two same day");
  r=await request("POST","/observations/types",{projectId,name:"Defective Leaf Count",dataType:"number",unit:"count"});ok(r,201,"second numeric type");const defectiveTypeId=r.data.data._id;
  r=await request("POST","/observations/records",{projectId,plotId:plots[0]._id,observationTypeId:defectiveTypeId,value:3});ok(r,201,"second numeric record");
  r=await request("POST","/observations/types",{projectId,name:"Field Comment",dataType:"text"});ok(r,201,"text type");const textTypeId=r.data.data._id;
  r=await request("POST","/observations/records",{projectId,plotId:plots[0]._id,observationTypeId:textTypeId,value:"Canopy healthy",note:"reviewed"});ok(r,201,"text record");
  r=await request("POST","/observations/types",{projectId,name:"Flowering",dataType:"boolean"});ok(r,201,"boolean type");const booleanTypeId=r.data.data._id;
  r=await request("POST","/observations/records",{projectId,plotId:plots[1]._id,observationTypeId:booleanTypeId,value:true});ok(r,201,"boolean record");
  r=await request("GET",`/observations/records?projectId=${projectId}&observationTypeId=${observationTypeId}`);ok(r,200,"persisted records");assert.equal(r.data.data.length,6);const recordId=r.data.data[0]._id;
  r=await request("GET",`/observations/graphs?projectId=${projectId}&observationTypeId=${observationTypeId}`);ok(r,200,"graphs");assert.equal(r.data.data.sessions.length,2);assert.equal(r.data.data.timeSeries.length,3);assert(r.data.data.sessions[0].label.endsWith("Round 1"));assert(r.data.data.sessions[1].label.endsWith("Round 2"));assert.deepEqual(r.data.data.sessions[0].comparePlots.map(x=>x.value),[1,1,1]);assert.deepEqual(r.data.data.sessions[1].comparePlots.map(x=>x.value),[2,2,2]);assert.deepEqual(r.data.data.sessions[0].compareTreatments.map(x=>x.average),[1,1]);assert.deepEqual(r.data.data.sessions[1].compareTreatments.map(x=>x.average),[2,2]);assert.deepEqual(r.data.data.timeSeries.map(x=>x.values.map(v=>v.value)),[[1,2],[1,2],[1,2]]);
  r=await request("GET",`/observations/summary?projectId=${projectId}&observationTypeId=${observationTypeId}`);ok(r,200,"summary");assert.equal(r.data.data.count,6);assert.equal(r.data.data.average,1.5);assert.equal(r.data.data.maximum,2);
  r=await request("PATCH","/observations/records",{projectId,recordId,value:2});ok(r,200,"edit record");assert.equal(r.data.data.value,2);
  fs.mkdirSync("tmp/export-test",{recursive:true});
  r=await request("GET",`/observations/export?projectId=${projectId}&format=csv`);ok(r,200,"CSV export");assert(String(r.data).includes("Plant Height")&&String(r.data).includes("Field Comment"));fs.writeFileSync("tmp/export-test/observations.csv",r.raw);
  r=await request("GET",`/observations/export?projectId=${projectId}&format=xlsx`);ok(r,200,"XLSX export");assert.equal(r.raw.slice(0,2).toString(),"PK");fs.writeFileSync("tmp/export-test/observations.xlsx",r.raw);
  r=await request("GET",`/observations/export?projectId=${projectId}&format=pdf`);ok(r,200,"PDF export");assert.equal(r.raw.slice(0,4).toString(),"%PDF");fs.writeFileSync("tmp/export-test/observations.pdf",r.raw);
  r=await request("DELETE","/projects",{_id:projectId});ok(r,200,"delete project");
  r=await request("GET",`/observations/types?projectId=${projectId}`);ok(r,404,"cascade verification");
  console.log("Observation API integration flow passed");
  } finally { await User.deleteOne({_id:testUser._id}); }
})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>require("mongoose").disconnect());
