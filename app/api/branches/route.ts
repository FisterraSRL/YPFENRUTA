import {json,token} from "@/lib/server";
import type {Branch} from "@/lib/branches";

// Loaded once per page load by the browser; cached briefly on the server to avoid repeated calls.
let cached:{value:Branch[];expires:number}|undefined;

export async function GET(){
  if(cached&&cached.expires>Date.now())return json({branches:cached.value});
  let accessToken:string;
  try{accessToken=await token();}catch(error){return json({error:error instanceof Error?error.message:"No se pudo autenticar."},503);}
  try{
    const response=await fetch("https://api.finneg.com/api/empresaSucursal/list?ACCESS_TOKEN="+encodeURIComponent(accessToken));
    const raw=await response.text();
    if(!response.ok)return json({error:"Finnegans respondió HTTP "+response.status+" al listar sucursales: "+raw.slice(0,200)},502);
    const body=JSON.parse(raw) as {Empresas?:{EmpresaID?:number;codigo?:string;Nombre?:string;EmpresaPadre?:string}[]};
    const branches=(body.Empresas??[])
      // Only Cruz del Sur branches for now: codes containing "CDS" (e.g. 014CDS, 049CDSTDF).
      .filter(e=>e.codigo&&e.Nombre&&/CDS/i.test(e.codigo))
      .map(e=>({id:Number(e.EmpresaID),code:String(e.codigo).trim(),name:String(e.Nombre).trim(),parent:String(e.EmpresaPadre??"").trim()}))
      .sort((a,b)=>a.name.localeCompare(b.name,"es",{numeric:true}));
    cached={value:branches,expires:Date.now()+10*60_000};
    return json({branches});
  }catch(error){
    return json({error:"No se pudieron obtener las sucursales de Finnegans: "+(error instanceof Error?error.message:"sin detalle")},502);
  }
}
