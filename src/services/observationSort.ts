export type LayoutOrder="replication"|"treatment";
export type LayoutItem={replicationId:string|number;treatmentId:string|number;plotId?:string};
export function compareLayout(a:LayoutItem,b:LayoutItem,order:LayoutOrder="replication"){
  const r=Number(a.replicationId)-Number(b.replicationId),t=Number(a.treatmentId)-Number(b.treatmentId);
  return(order==="replication"?r||t:t||r)||String(a.plotId||"").localeCompare(String(b.plotId||""));
}
export const sortLayout=<T extends LayoutItem>(items:T[],order:LayoutOrder="replication")=>[...items].sort((a,b)=>compareLayout(a,b,order));
