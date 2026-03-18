
export const comprobanteFactura = { codigo: "01", descripcion: 'Factura' , cnoDescripcion:'01 - Factura'};
export const comprobanteNotaVenta = { codigo: "02", descripcion: 'Nota de Venta', cnoDescripcion:'02 - Nota de Venta' };
export const comprobanteLiquidacionCompra = { codigo: "03", descripcion: 'Liquidación de compra' , cnoDescripcion:'03 - Liquidación de compra'};
export const comprobanteNotaCredito = { codigo: "04", descripcion: 'Nota de crédito' , cnoDescripcion:'04 - Nota de crédito'};
export const comprobanteNotaDebito = { codigo: "05", descripcion: 'Nota de débito' , cnoDescripcion:'05 - Nota de débito'};
export const comprobanteGuiaRemision = { codigo: "06", descripcion: 'Guia de Remisión' , cnoDescripcion:'06 - Guia de Remisión'};
export const comprobanteRetencion = { codigo: "07", descripcion: 'Retención' , cnoDescripcion:'07 - Retención'};


export const listadoComprobantes = [
  comprobanteFactura,
  comprobanteNotaVenta,
  comprobanteLiquidacionCompra,
  comprobanteNotaCredito,
  comprobanteNotaDebito,
  comprobanteRetencion,
  comprobanteGuiaRemision
];


export const estadoAutorizado = { codigo: "A", descripcion: 'AUTORIZADO' };
export const estadoPendiente = { codigo: "P", descripcion: 'PENDIENTE' };
export const estadoAnulado = { codigo: "N", descripcion: 'ANULADO' };

export const estadoComprobanteElectronico = [
  estadoAutorizado,
  estadoPendiente,
  estadoAnulado
];



export const fechaCreacion = { codigo: "3", descripcion: 'Fecha Creación' };
export const fechaEmision = { codigo: "4", descripcion: 'Fecha Emisión' };



export let tipoFechaComprobanteElectronico = [
  fechaEmision,
  fechaCreacion,
];

