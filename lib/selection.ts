import {identifier,type SourceRow} from "./receipts";
export function selectedReceipts(rows:SourceRow[],selected:ReadonlySet<number>,results:Record<string,unknown>){return rows.filter(r=>selected.has(r.row)&&!r.errors.length&&!results[identifier(r)]);}
