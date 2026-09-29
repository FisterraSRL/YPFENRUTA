"use client";
import {X,CheckCircle2,AlertTriangle,XCircle,Info} from "lucide-react";
import {Dialog,DialogContent,DialogTitle,DialogDescription} from "@/components/ui/dialog";

// Finnegans GO style modal: title bar with close button, body, gray footer with actions.
export function FinModal({open,onClose,title,subtitle,size="md",children,footer}:{open:boolean;onClose:()=>void;title:React.ReactNode;subtitle?:React.ReactNode;size?:"sm"|"md"|"lg";children:React.ReactNode;footer?:React.ReactNode}){
  return <Dialog open={open} onOpenChange={o=>{if(!o)onClose();}}>
    <DialogContent showCloseButton={false} className={"fin-modal fin-modal-"+size}>
      <div className="fin-modal-head"><div><DialogTitle className="fin-modal-title">{title}</DialogTitle>{subtitle&&<DialogDescription className="fin-modal-subtitle">{subtitle}</DialogDescription>}</div><button type="button" className="fin-modal-close" aria-label="Cerrar" onClick={onClose}><X size={18}/></button></div>
      <div className="fin-modal-body">{children}</div>
      {footer&&<div className="fin-modal-foot">{footer}</div>}
    </DialogContent>
  </Dialog>;
}

export type MessageKind="error"|"warning"|"success"|"info";
export type Message={kind:MessageKind;title:string;text:string;detail?:string};
const ICONS={error:XCircle,warning:AlertTriangle,success:CheckCircle2,info:Info};

// Every message shown to the user goes through this modal and must be acknowledged.
export function MessageModal({message,onClose}:{message:Message|null;onClose:()=>void}){
  const Icon=ICONS[message?.kind??"info"];
  return <FinModal open={!!message} onClose={onClose} size="sm" title={message?.title} footer={<button type="button" className="fin-primary" autoFocus onClick={onClose}>Aceptar</button>}>
    {message&&<div className={"fin-message fin-message-"+message.kind}><Icon size={30}/><div><p>{message.text}</p>{message.detail&&<pre>{message.detail}</pre>}</div></div>}
  </FinModal>;
}
