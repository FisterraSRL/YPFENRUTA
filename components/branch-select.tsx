"use client";
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {createPortal} from "react-dom";
import {ChevronDown,Search} from "lucide-react";
import {searchBranches,type Branch} from "@/lib/branches";

// Searchable branch picker for one grid row. The list renders in a fixed panel so the grid scroll does not clip it.
export function BranchSelect({value,branches,excel,disabled,sameCount,onChange,className,placeholder="Elegir sucursal",searchLabel="Buscar sucursal o código…"}:{value?:string;branches:Branch[];excel?:string;disabled?:boolean;sameCount:number;onChange:(code:string,applyToSame:boolean)=>void;className?:string;placeholder?:string;searchLabel?:string}){
  const [open,setOpen]=useState(false),[query,setQuery]=useState(""),[active,setActive]=useState(0),[applySame,setApplySame]=useState(true);
  const [pos,setPos]=useState<{left:number;top:number;width:number;up:boolean}>({left:0,top:0,width:320,up:false});
  const button=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null),list=useRef<HTMLUListElement>(null);
  const current=branches.find(b=>b.code===value);
  const options=useMemo(()=>searchBranches(query,branches),[query,branches]);

  useLayoutEffect(()=>{
    if(!open||!button.current)return;
    const r=button.current.getBoundingClientRect(),width=Math.max(r.width,340),up=window.innerHeight-r.bottom<320&&r.top>320;
    setPos({left:Math.min(r.left,window.innerWidth-width-8),top:up?r.top-4:r.bottom+4,width,up});
  },[open]);
  useEffect(()=>{
    if(!open)return;
    const close=(e:Event)=>{if(e.type==="scroll"&&panel.current?.contains(e.target as Node))return;if(e.type==="mousedown"&&(panel.current?.contains(e.target as Node)||button.current?.contains(e.target as Node)))return;setOpen(false);};
    document.addEventListener("mousedown",close);window.addEventListener("scroll",close,true);window.addEventListener("resize",close);
    return()=>{document.removeEventListener("mousedown",close);window.removeEventListener("scroll",close,true);window.removeEventListener("resize",close);};
  },[open]);
  // Keep the active option visible by scrolling only the list (scrollIntoView would also scroll the page and close the panel).
  useEffect(()=>{const ul=list.current,li=ul?.querySelector<HTMLElement>("[data-active=true]");if(!ul||!li)return;const top=li.offsetTop-ul.offsetTop;if(top<ul.scrollTop)ul.scrollTop=top;else if(top+li.offsetHeight>ul.scrollTop+ul.clientHeight)ul.scrollTop=top+li.offsetHeight-ul.clientHeight;},[active,open]);

  function toggle(){if(disabled)return;setQuery("");setActive(Math.max(0,branches.findIndex(b=>b.code===value)));setApplySame(true);setOpen(!open);}
  function choose(b:Branch){onChange(b.code,applySame&&sameCount>1);setOpen(false);button.current?.focus();}
  function key(e:React.KeyboardEvent){
    if(e.key==="ArrowDown"){e.preventDefault();setActive(i=>Math.min(i+1,options.length-1));}
    else if(e.key==="ArrowUp"){e.preventDefault();setActive(i=>Math.max(i-1,0));}
    else if(e.key==="Enter"){e.preventDefault();if(options[active])choose(options[active]);}
    else if(e.key==="Escape"){e.preventDefault();setOpen(false);button.current?.focus();}
  }

  return <>
    <button ref={button} type="button" className={"branch-select"+(value?"":" empty")+(className?" "+className:"")} disabled={disabled} onClick={toggle} aria-haspopup="listbox" aria-expanded={open} title={current?current.code+" · "+current.name:placeholder}>
      <span>{current?<><b>{current.code}</b> {current.name}</>:value?<b>{value}</b>:placeholder}</span><ChevronDown size={14}/>
    </button>
    {open&&createPortal(<div ref={panel} className={"branch-panel"+(pos.up?" up":"")} style={{left:pos.left,top:pos.top,width:pos.width}} onKeyDown={key}>
      <div className="branch-search"><Search size={14}/><input autoFocus placeholder={searchLabel} value={query} onChange={e=>{setQuery(e.target.value);setActive(0);}} aria-label="Buscar sucursal"/></div>
      {excel&&<p className="branch-hint">Excel: <b>{excel}</b></p>}
      <ul ref={list} role="listbox">{options.length?options.map((b,i)=><li key={b.id} role="option" aria-selected={b.code===value} data-active={i===active} onMouseEnter={()=>setActive(i)} onMouseDown={e=>{e.preventDefault();choose(b);}}><b>{b.code}</b><span>{b.name}</span></li>):<li className="branch-none">Sin resultados</li>}</ul>
      {sameCount>1&&<label className="branch-same"><input type="checkbox" checked={applySame} onChange={e=>setApplySame(e.target.checked)}/>Aplicar a las {sameCount} filas con sucursal “{excel||"vacía"}”</label>}
    </div>,document.body)}
  </>;
}
