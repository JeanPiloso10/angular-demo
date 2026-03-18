export const fechaPedido = { codigo: "1", descripcion: 'Fecha Pedido' };
export const fechaAprobacion = { codigo: "2", descripcion: 'Fecha Aprobación' };
export const fechaCreacion = { codigo: "3", descripcion: 'Fecha Creación' };
export const fechaEmision = { codigo: "4", descripcion: 'Fecha Emisión' };
export const fechaAutorizacion = { codigo: "5", descripcion: 'Fecha Autorización' };
export const fechaOrden = { codigo: "6", descripcion: 'Fecha Orden' };
export const fechaListaPrecio = { codigo: "7", descripcion: 'Fecha Lista Precio' };
export const fechaMovimiento = { codigo: "8", descripcion: 'Fecha Movimiento' };

export let tipoFechaOrdenCompra = [
  fechaOrden,
  fechaAprobacion,
  fechaCreacion,
];

export let tipoFechaRequisicion = [
  fechaPedido,
  fechaAprobacion,
  fechaCreacion,
];

export let tipoFechaListaPrecio = [
  fechaListaPrecio,
];

export let tipoFechaSolicitudListaPrecio = [
  fechaCreacion,
  fechaAprobacion,
];

export let tipoFechaRequerimientoInventario = [
  fechaPedido,
  fechaAprobacion,
  fechaCreacion,
];

export let tipoFechaMovimientoInventario = [
  fechaMovimiento,
  fechaAprobacion,
  fechaCreacion,
];


export const tipoReporteCabecera = { codigo: "C", descripcion: 'CABECERA' };
export const tipoReporteDetalle = { codigo: "D", descripcion: 'DETALLE' };

export let tipoReporte = [
  tipoReporteCabecera,
  tipoReporteDetalle
];

export const tipoCompraProductos = { codigo: "P", descripcion: 'Productos' };
export const tipoCompraServicios = { codigo: "S", descripcion: 'Servicios' };





