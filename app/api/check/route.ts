import {checkOrigin,json} from "@/lib/server";

export async function POST(req:Request){
  if(!checkOrigin(req))return json({error:"Origen no permitido."},403);
  return json({results:{}});
}
