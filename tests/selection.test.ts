import assert from "node:assert/strict";import {selectedReceipts} from "../lib/selection";import {identifier,type SourceRow} from "../lib/receipts";
const base:SourceRow={row:2,date:"2026-08-11",time:"14:30:00",sourceHash:"0123456789abcdef",card:"70841431002613811",plate:"AE664ED",sap:"152467",invoice:"F1",quantity:30.11,price:1457.24,net:43877.5,product:"NAFTA",businessName:"Proveedor ejemplo",sucdes:"014CDS",errors:[]};
const rows=[base,{...base,row:3,plate:"AA111AA",net:100},{...base,row:4,plate:"BB222BB",errors:["Revisar"]}];
assert.deepEqual(selectedReceipts(rows,new Set(),{}),[]);
assert.deepEqual(selectedReceipts(rows,new Set([3]),{}).map(r=>r.row),[3]);
assert.deepEqual(selectedReceipts(rows,new Set([2,3,4]),{[identifier(base)]:{status:"sent"}}).map(r=>r.row),[3]);
assert.equal(selectedReceipts(rows,new Set([3]),{}).reduce((s,r)=>s+r.net,0),100);
const selected=new Set([2]);selected.delete(2);assert.equal(selectedReceipts(rows,selected,{}).length,0);
console.log("PASS: ninguna selección, selección individual, exclusión de inválidas/enviadas, neto seleccionado y desmarcado.");
