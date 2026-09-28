import {checkOrigin,config,json,token} from "@/lib/server";
import {payload,type SourceRow} from "@/lib/receipts";
import {apiResponseMessage} from "@/lib/api-response";
import {isRetryableRejection} from "@/lib/send-status";

export async function POST(req:Request){
  if(!checkOrigin(req))return json({error:"Origen no permitido."},403);

  let p:ReturnType<typeof payload>;
  try{
    const row=await req.json() as SourceRow;
    p=payload(row);
  }catch{
    return json({error:"Datos inválidos. Revisá la fila."},400);
  }

  let accessToken:string;
  try{
    accessToken=await token();
  }catch(error){
    return json({error:error instanceof Error?error.message:"No se pudo autenticar."},503);
  }

  const db=config().DB;
  const startedAt=new Date().toISOString();
  let claimed;
  try{
    claimed=await db.prepare("INSERT INTO receipts (id,status,created_at,message) VALUES (?, 'pending', ?, ?) ON CONFLICT(id) DO NOTHING")
      .bind(p.IdentificacionExterna,startedAt,"Envío iniciado. Verificar en Finnegans antes de repetir.").run();
  }catch{
    return json({error:"No se pudo registrar el envío. No se envió la recepción."},503);
  }

  if(!claimed.meta.changes){
    const previous=await db.prepare("SELECT status,message FROM receipts WHERE id=?").bind(p.IdentificacionExterna).first<{status:string;message:string}>();
    if(!isRetryableRejection(previous))return json({duplicate:true,...previous},409);
    const reclaimed=await db.prepare("UPDATE receipts SET status='pending',created_at=?,message=? WHERE id=? AND (status='failed' OR (status='uncertain' AND message LIKE 'Respuesta API (HTTP %'))")
      .bind(startedAt,"Reintento de un rechazo anterior iniciado.",p.IdentificacionExterna).run();
    if(!reclaimed.meta.changes)return json({duplicate:true,...previous},409);
  }

  let status="uncertain";
  let message="Resultado incierto. Verificá en Finnegans antes de volver a cargar esta recepción.";
  try{
    const url="https://api.finneg.com/api/recepcionCompraCDS?ACCESS_TOKEN="+encodeURIComponent(accessToken);
    const response=await fetch(url,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(p),
    });
    const raw=await response.text();
    let body:unknown;
    try{body=JSON.parse(raw);}catch{body=raw;}
    const record=typeof body==="object"&&body!==null?body as Record<string,unknown>:{};
    const businessError=record.error||record.Error||record.errors||record.Errores||record.success===false||record.Success===false;
    const html=typeof body==="string"&&/^\s*</.test(body);
    message=apiResponseMessage(response.status,body,raw);
    status=response.ok&&!businessError&&!html?"sent":"failed";
  }catch(error){
    const detail=error instanceof Error?error.message:String(error);
    message="Error de red al llamar a recepcionCompraCDS: "+(detail||"sin detalle");
  }

  try{
    await db.prepare("UPDATE receipts SET status=?,message=? WHERE id=?").bind(status,message,p.IdentificacionExterna).run();
  }catch{
    return json({status:"uncertain",message:"Se intentó el envío, pero no se pudo guardar el resultado. Verificá en Finnegans."},502);
  }
  return json({status,message},status==="sent"?200:502);
}
