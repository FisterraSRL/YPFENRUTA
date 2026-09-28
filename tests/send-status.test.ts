import assert from "node:assert/strict";
import {isRetryableRejection} from "../lib/send-status";

assert.equal(isRetryableRejection({status:"failed",message:"Proveedor inválido"}),true);
assert.equal(isRetryableRejection({status:"uncertain",message:"Respuesta API (HTTP 500): organización inexistente"}),true);
assert.equal(isRetryableRejection({status:"uncertain",message:"Error de red al llamar a recepcionCompra"}),false);
assert.equal(isRetryableRejection({status:"sent",message:"Respuesta API (HTTP 200): creada"}),false);

console.log("PASS: API rejections are retryable; sent and network-uncertain receipts remain protected");
