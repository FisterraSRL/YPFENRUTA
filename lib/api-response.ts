const MESSAGE_KEYS = [
  "mensaje",
  "Mensaje",
  "message",
  "Message",
  "detalle",
  "Detalle",
  "detail",
  "Detail",
  "descripcion",
  "Descripcion",
  "description",
  "Description",
  "error",
  "Error",
  "errors",
  "Errores",
] as const;

function safeText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(safeText).filter(Boolean).join(" · ");
  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return "";
}

export function apiResponseMessage(status: number, body: unknown, raw: string): string {
  let detail = "";
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const record = body as Record<string, unknown>;
    for (const key of MESSAGE_KEYS) {
      detail = safeText(record[key]);
      if (detail) break;
    }
    if (!detail) detail = safeText(record);
  } else {
    detail = safeText(body);
  }

  if (!detail) detail = raw.trim() || "La API no devolvió contenido.";
  const clean = detail.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return ("Respuesta API (HTTP " + status + "): " + clean).slice(0, 8000);
}
