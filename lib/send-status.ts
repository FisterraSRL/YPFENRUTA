export type StoredResult={status:string;message:string};

export function isRetryableRejection(result:StoredResult|undefined|null){
  if(!result)return false;
  return result.status==="failed"||
    (result.status==="uncertain"&&result.message.startsWith("Respuesta API (HTTP "));
}
