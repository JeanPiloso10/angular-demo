export const ESTADO_BASE = [
  { codigo: "I", descripcion: "INGRESADO" },
  { codigo: "S", descripcion: "PENDIENTE APROBACIÓN" },
  { codigo: "A", descripcion: "APROBADO" },
  { codigo: "L", descripcion: "ORDENADO PARCIAL" },
  { codigo: "T", descripcion: "ORDENADO TOTAL" },
  { codigo: "N", descripcion: "ANULADO" },
  { codigo: "G", descripcion: "NEGADO" },
  { codigo: "X", descripcion: "CERRADO" },
  { codigo: "E", descripcion: "PENDIENTE" },
] as const;

export const overrideFrom = (lista: readonly any[], overrides: Record<string, string>) =>
  lista.map(e => ({
    ...e,
    descripcion: overrides[e.codigo] ?? e.descripcion
  }));

export const removeFrom = (lista: readonly any[], codigos: string[]) =>
  lista.filter(e => !codigos.includes(e.codigo));


export const ESTADO_REQUISICION = removeFrom(ESTADO_BASE, ["E"]);

export const ESTADO_ORDEN_COMPRA = removeFrom(
  overrideFrom(ESTADO_BASE, { L: "RECIBIDA PARCIAL", T: "RECIBIDA TOTAL" }),
  ["E"]
);

export const ESTADO_REQUERIMIENTO_INVENTARIO = overrideFrom(ESTADO_BASE, {
  L: "DESPACHADO PARCIAL",
  T: "DESPACHADO TOTAL",
});

export const ESTADO_FACTURA = overrideFrom(ESTADO_BASE, {
  L: "FACTURADO PARCIAL",
  T: "FACTURADO TOTAL",
  E: "NO FACTURADO",
});

export const ESTADO_PAGO = overrideFrom(ESTADO_BASE, {
  L: "PAGADA PARCIAL",
  T: "PAGADA TOTAL",
  E: "NO PAGADA",
});

export const ESTADO_LISTA_PRECIO = removeFrom(ESTADO_BASE, ["X", "E"]);

export const ESTADO_MOVIMIENTO_INVENTARIO = removeFrom(ESTADO_BASE, ["E", "L", "T", "X", "G", "S"]);