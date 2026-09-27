# Importador YPF en ruta

Portal de revisión de la hoja FINAL. Cada fila genera una recepción y el envío requiere pulsar Enviar y confirmar el lote.

## Uso local

Instalar dependencias con npm install. Copiar .env.example a .dev.vars y completar credenciales. Ejecutar npx wrangler d1 migrations apply DB --local --config wrangler.local.json. Ejecutar npm run dev.

## Reglas

Proveedor: N° SAP. Fecha: fecha de transacción sin hora. Identificación: fecha_tarjeta_PATENTEpatente, conservando tarjeta completa. Precio: PU negativo redondeado a 6 decimales. Neto: NETO FACTURADO redondeado a 4 decimales, sin recalcularlo a partir de precio y cantidad. Producto fijo 62 para todos los consumos. Dimensiones fijas DIMCTC/1160 y SUCDES/014CDS, ambas al 100%.

Las identificaciones repetidas en el archivo se bloquean y no se agrupan ni se modifican automáticamente. El registro D1 impide repetir una identificación enviada o cuyo resultado esté pendiente/incierto. Los resultados inciertos requieren conciliación con Finnegans; no hay reintentos automáticos. Una respuesta HTTP 2xx sin indicadores conocidos de error se registra como enviada; validar la primera recepción real en Finnegans.

El archivo se procesa en el navegador; solo se envían las filas confirmadas. Las credenciales residen en el servidor. El portal se publica con acceso privado del propietario.

No se hicieron llamadas reales a Finnegans durante el desarrollo. Pruebas con datos locales y respuestas simuladas.
