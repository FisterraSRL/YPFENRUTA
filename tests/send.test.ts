import assert from "node:assert/strict";
import {POST} from "../app/api/send/route";
import {identifier} from "../lib/receipts";
import {records} from "./mock-env";

const row={
  row:2,
  date:"2026-08-11",
  time:"14:30:00",
  sourceHash:"0123456789abcdef",
  card:"70841431002613811",
  plate:"AE664ED",
  sap:"152467",
  invoice:"F1",
  quantity:30.11,
  price:1457.24,
  net:43877.5,
  product:"NAFTA",
  errors:[],
};
let calls=0;
let mode="ok";
globalThis.fetch=async(input,init)=>{
  const url=new URL(String(input));
  if(url.pathname.includes("oauth"))return new Response("test-token-123456789");
  assert.equal(url.pathname,"/api/recepcionCompraCDS");
  calls++;
  assert.equal(init?.method,"POST");
  const data=JSON.parse(String(init?.body));
  assert.equal(data.CondicionPagoCodigo,"15");
  assert.equal("OperacionCondicionesPago" in data,false);
  assert.equal(data.Items[0].Precio,-1457.24);
  if(mode==="timeout")throw new Error("timeout");
  return Response.json(mode==="error"?{error:"Rejected"}:{TransaccionID:123});
};
const request=(data:unknown,origin="https://test.local")=>new Request("https://test.local/api/send",{
  method:"POST",
  headers:{"Origin":origin,"x-ypf-action":"reviewed","Content-Type":"application/json"},
  body:JSON.stringify(data),
});

assert.equal((await POST(request(row,"https://evil.test"))).status,403);
assert.equal((await POST(request({...row,sap:""}))).status,400);
assert.equal(calls,0);
const success=await POST(request(row));
assert.equal(success.status,200);
const successBody=await success.json() as {message:string};
assert.match(successBody.message,/TransaccionID.*123/);
assert.equal((await POST(request(row))).status,409);
assert.equal(calls,1);

mode="timeout";
const second={...row,plate:"BB222BB",sourceHash:"1123456789abcdef"};
assert.equal((await POST(request(second))).status,502);
assert.equal((await POST(request(second))).status,409);
assert.equal(calls,2);

mode="error";
const third={...row,plate:"CC333CC",sourceHash:"2123456789abcdef"};
const rejected=await POST(request(third));
assert.equal(rejected.status,502);
const rejectedBody=await rejected.json() as {message:string};
assert.match(rejectedBody.message,/Rejected/);
assert.equal(records.get(identifier(third))?.status,"failed");
mode="ok";
assert.equal((await POST(request(third))).status,200);
assert.equal(calls,4);
assert.equal([...records.values()].filter(record=>record.status==="sent").length,2);
console.log("PASS: same-origin enforcement, date-time identity, API response, duplicate prevention, timeout no retry, retryable business rejection");
