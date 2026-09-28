import {NextResponse,type NextRequest} from "next/server";

// Basic Auth for the whole portal. Credentials live in PORTAL_USER / PORTAL_PASSWORD.
export function proxy(req:NextRequest){
  const user=process.env.PORTAL_USER,password=process.env.PORTAL_PASSWORD;
  if(!user||!password)return new NextResponse("Portal sin configurar: faltan PORTAL_USER y PORTAL_PASSWORD.",{status:503});
  const header=req.headers.get("authorization")??"";
  if(header.startsWith("Basic ")){
    const decoded=atob(header.slice(6));
    const i=decoded.indexOf(":");
    if(i>=0&&decoded.slice(0,i)===user&&decoded.slice(i+1)===password)return NextResponse.next();
  }
  return new NextResponse("Autenticación requerida.",{status:401,headers:{"WWW-Authenticate":'Basic realm="YPF en ruta", charset="UTF-8"'}});
}

export const config={matcher:["/((?!_next/static|_next/image|favicon.svg).*)"]};
