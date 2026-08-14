import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import sharp from "sharp";
export type SelectedChart={title:string;subtitle?:string;svg:string;columns:string[];rows:Array<Array<string|number|null>>};
export async function createSelectedCharts(charts:SelectedChart[],format:"png"|"pdf"|"xlsx"){
  if(format==="png")return sharp(Buffer.from(charts[0].svg)).png().toBuffer();
  if(format==="xlsx"){const wb=new ExcelJS.Workbook();wb.creator="ResearchPal";for(const [i,chart] of charts.entries()){const sheet=wb.addWorksheet(`Chart ${i+1}`);sheet.addRow([chart.title]);sheet.addRow([chart.subtitle||""]);sheet.addRow(chart.columns);chart.rows.forEach(row=>sheet.addRow(row));sheet.getRow(3).font={bold:true,color:{argb:"FFFFFFFF"}};sheet.getRow(3).fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF1F6F63"}};sheet.columns.forEach(c=>c.width=20);const png=await sharp(Buffer.from(chart.svg)).png().toBuffer();sheet.addImage(wb.addImage({buffer:png as any,extension:"png"}),{tl:{col:chart.columns.length+1,row:0},ext:{width:720,height:360}})}return Buffer.from(await wb.xlsx.writeBuffer())}
  return new Promise<Buffer>((resolve,reject)=>{const doc=new PDFDocument({size:"A4",margin:42}),chunks:Buffer[]=[];doc.on("data",x=>chunks.push(x));doc.on("end",()=>resolve(Buffer.concat(chunks)));doc.on("error",reject);charts.forEach((chart,index)=>{if(index)doc.addPage();doc.font("Helvetica-Bold").fontSize(18).text(chart.title);if(chart.subtitle)doc.font("Helvetica").fontSize(10).text(chart.subtitle);doc.moveDown();SVGtoPDF(doc,chart.svg,42,doc.y,{width:510,height:300})});doc.end()});
}
