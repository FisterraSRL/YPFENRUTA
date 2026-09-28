import assert from "node:assert/strict";
import fs from "node:fs/promises";
import ExcelJS from "exceljs";
import {readExcel} from "../lib/excel";
import {payload,validate,identifier,type SourceRow} from "../lib/receipts";

const source=process.argv[2];
const data=await fs.readFile(source);
const rows=await readExcel(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength));
assert.equal(rows.length,563);
assert.equal(rows[0].businessName,"OBREQUE URRUTIA JOSE EDUARDO");
assert.match(rows[0].time,/^\d{2}:\d{2}:\d{2}$/);
assert.match(rows[0].sourceHash,/^[0-9a-f]{16}$/);

const firstPayload=payload(rows[0]);
assert.equal(firstPayload.Fecha,"2026-08-11");
assert.equal(firstPayload.Proveedor,"152467");
assert.match(firstPayload.IdentificacionExterna,/^2026-08-11_\d{6}_70841431002613811_PATENTEAE664ED_LTS30-11_[0-9a-f]{16}$/);
assert.equal(firstPayload.Items[0].CantidadWorkflow,30.11);
assert.equal(firstPayload.Items[0].Precio,-1457.237747);
assert.equal(firstPayload.Items[0].DimensionDistribucion[0].distribucionItems[0].importe,43877.4286);
assert.equal(firstPayload.NumeroComprobante,"F1420A00275738");
assert.equal(firstPayload.OperacionCondicionesPago,"0-0");
assert.equal(firstPayload.Items[0].ProductoCodigo,"62");
assert(validate({...rows[0],date:"2026-02-30"}).length);
assert(validate({...rows[0],time:"27:00:00"}).length);
assert(validate({...rows[0],quantity:NaN}).length);
assert.throws(()=>payload({...rows[0],sap:""}));

const workbook=new ExcelJS.Workbook();
const sheet=workbook.addWorksheet("FINAL");
sheet.addRow(["TARJETA","N° SAP","PATENTE","NRO.FACTURA","FECHA DE TRANSACCION","CANTIDAD LTS","PU","NETO FACTURADO","EXTRA"]);
sheet.addRow(["70841431002613811",123,"AAA111","F1","01/08/2026 10:00:00",2,3,6,"A"]);
sheet.addRow(["70841431002613811",123,"AAA111","F1","01/08/2026 12:00:00",2,3,6,"A"]);
sheet.addRow(["70841431002613811",123,"AAA111","F1","01/08/2026 12:00:00",4,3,12,"A"]);
sheet.addRow(["70841431002613811",123,"AAA111","F1","01/08/2026 12:00:00",4,3,12,"B"]);
sheet.addRow(["70841431002613811",123,"AAA111","F1","01/08/2026 12:00:00",4,3,12,"B"]);
const buffer=await workbook.xlsx.writeBuffer();
const compared=await readExcel(buffer as unknown as ArrayBuffer);
assert.equal(compared[0].errors.some(error=>error.includes("duplicada")),false);
assert.equal(compared[1].errors.some(error=>error.includes("duplicada")),false);
assert.equal(compared[2].errors.some(error=>error.includes("duplicada")),false);
assert.equal(compared[3].errors.some(error=>error.includes("duplicada")),true);
assert.equal(compared[4].errors.some(error=>error.includes("duplicada")),true);
assert.notEqual(identifier(compared[0]),identifier(compared[1]));
assert.notEqual(identifier(compared[1]),identifier(compared[2]));
assert.notEqual(identifier(compared[2]),identifier(compared[3]));
assert.equal(identifier(compared[3]),identifier(compared[4]));

sheet.getCell("A3").value=70841431002613811;
const precisionBuffer=await workbook.xlsx.writeBuffer();
assert((await readExcel(precisionBuffer as unknown as ArrayBuffer))[1].errors.some(error=>error.includes("precisión")));

console.log(JSON.stringify({
  rows:rows.length,
  valid:rows.filter(row=>!row.errors.length).length,
  observed:rows.filter(row=>row.errors.length).length,
  issues:[...new Set(rows.flatMap(row=>row.errors))],
  tests:"mapping, date and time, precision, required fields, exact full-row duplicates: passed",
}));
