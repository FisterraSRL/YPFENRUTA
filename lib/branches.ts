// Branches (empresaSucursal) from Finnegans and matching against the Excel "Sucursal" column.
export type Branch={id:number;code:string;name:string;parent:string};

const ABBREVIATIONS:[RegExp,string][]=[[/\bGRAL\b/g,"GENERAL"],[/\bING\b/g,"INGENIERO"],[/\bPTO\b/g,"PUERTO"],[/\bSTA\b/g,"SANTA"],[/\bSTO\b/g,"SANTO"],[/\bBS AS\b/g,"BUENOS AIRES"]];

export function normalizeBranch(value:string){
  let s=value.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Z0-9]+/g," ").trim();
  for(const [pattern,full]of ABBREVIATIONS)s=s.replace(pattern,full);
  return s;
}

// "14 Neuquén" -> "NEUQUEN"; "02 BS - Bahia Blanca - Beel Sur" -> "BAHIA BLANCA"; "20 Viedma *" -> "VIEDMA"
export function branchCity(name:string){
  return normalizeBranch(name.replace(/^\s*[\d\s]+/,"").replace(/^BS\s*-\s*/i,"").replace(/\s*-\s*Beel Sur\s*$/i,""));
}

const isCds=(b:Branch)=>/CDS$/i.test(b.code);

// Best branch for an Excel value: exact city match first, then a unique partial match. Cruz del Sur (…CDS) wins ties.
export function matchBranch(excel:string,branches:Branch[]):Branch|undefined{
  const target=normalizeBranch(excel);
  if(!target)return undefined;
  const pick=(list:Branch[])=>list.find(isCds)??(list.length===1?list[0]:undefined);
  const exact=branches.filter(b=>branchCity(b.name)===target);
  if(exact.length)return pick(exact);
  const words=(s:string)=>new RegExp("(^| )"+s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"( |$)");
  const partial=branches.filter(b=>{const city=branchCity(b.name);return city.length>3&&(words(target).test(city)||words(city).test(target));});
  const cds=partial.filter(isCds);
  if(cds.length===1)return cds[0];
  return partial.length===1?partial[0]:undefined;
}

export function searchBranches(query:string,branches:Branch[]){
  const q=normalizeBranch(query);
  if(!q)return branches;
  return branches.filter(b=>normalizeBranch(b.name+" "+b.code).includes(q));
}
