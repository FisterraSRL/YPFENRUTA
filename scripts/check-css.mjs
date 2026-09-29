import {readFileSync} from "node:fs";
import {join} from "node:path";

const html=readFileSync(".next/server/app/index.html","utf8");
const paths=[...html.matchAll(/href="\/_next\/static\/([^"]+\.css)"/g)].map(match=>match[1]);
if(!paths.length)throw new Error("La página compilada no enlaza ninguna hoja CSS.");

const css=paths.map(path=>readFileSync(join(".next/static",path),"utf8")).join("\n");
for(const selector of [".view-title", ".dropzone", ".fin-modal"]){
  if(!css.includes(selector))throw new Error(`Falta ${selector} en el CSS enlazado por la página.`);
}
console.log(`CSS de la versión actual verificado en ${paths.length} archivo(s).`);
