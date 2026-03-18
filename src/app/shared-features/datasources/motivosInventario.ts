
export const tipoMotivoInventario = [{ codigo: "I", descripcion: 'Ingreso', cnoDescripcion: 'I - Ingreso' }, { codigo: "E", descripcion: 'Egreso', cnoDescripcion: 'E - Egreso' }];
export const modoMotivoInventario = [{ codigo: "U", descripcion: 'Usuario', cnoDescripcion: 'U - Usuario' }, { codigo: "S", descripcion: 'Sistema', cnoDescripcion: 'S - Sistema' }];
export const origenIngreso = [{ codigo: "P", descripcion: 'Compras', cnoDescripcion: 'P - Compras' }, { codigo: "D", descripcion: 'Devoluciones en Venta', cnoDescripcion: 'D - Devoluciones en Venta' },
{ codigo: "O", descripcion: 'Otros', cnoDescripcion: 'O - Otros' }];
export const origenEgreso = [{ codigo: "P", descripcion: 'Consumos', cnoDescripcion: 'P - Consumos' }, { codigo: "D", descripcion: 'Devoluciones en Compras', cnoDescripcion: 'D - Devoluciones en Compras' },
{ codigo: "I", descripcion: 'Ventas', cnoDescripcion: 'I - Ventas' }, { codigo: "O", descripcion: 'Otros', cnoDescripcion: 'O - Otros' }];

// CUANDO SE SELECCIONA EL TIPO "INGRESO" Y EL ORIGEN "COMPRAS" Y SE ACTIVA "GENERA COMPROBANTE CONTABLE EN LINEA"
export const comprobanteContableEnLinea = [
  { codigo: "I", descripcion: 'Ingreso Orden Compra', cnoDescripcion: 'I - Ingreso Orden Compra' },
  { codigo: "D", descripcion: 'Documento por Pagar', cnoDescripcion: 'D - Documento por Pagar' },
]


// LOS DATOS DEL COMBO 1
export const cb1_precioAutomatico = [
  { codigo: "C", descripcion: 'Última Compra', cnoDescripcion: 'C - Última Compra' },
  { codigo: "I", descripcion: 'Último Ingreso', cnoDescripcion: 'I - Último Ingreso' },
  { codigo: "P", descripcion: 'Precio Promedio', cnoDescripcion: 'P - Precio Promedio' }];

 // CUANDO HA SELECCIONADO "ÚLTIMA COMPRA "EN EL COMBO 1, ENTONCES LOS DATOS DEL COMBO 2 SON: 
 export const cb1_ultima_compra = [
   { codigo: "C", descripcion: 'Precio Cero', cnoDescripcion: 'C - Precio Cero' },
   { codigo: "I", descripcion: 'Último Ingreso', cnoDescripcion: 'I - Último Ingreso' },
   { codigo: "P", descripcion: 'Precio Promedio', cnoDescripcion: 'P - Precio Promedio' }];
   
// CUANDO HA SELECCIONADO "ÚLTIMO INGRESO "EN EL COMBO 1, ENTONCES LOS DATOS DEL COMBO 2 SON:
export const cb1_ultimo_ingreso= [
  { codigo: "C", descripcion: 'Precio Cero', cnoDescripcion: 'C - Precio Cero' },
  { codigo: "I", descripcion: 'Última Compra', cnoDescripcion: 'I - Última Compra' },
  { codigo: "P", descripcion: 'Precio Promedio', cnoDescripcion: 'P - Precio Promedio' }]; 

// CUANDO HA SELECCIONADO "PRECIO PROMEDIO "EN EL COMBO 1, ENTONCES LOS DATOS DEL COMBO 2 SON:
export const cb1_precio_promedio = [
    { codigo: "C", descripcion: 'Precio Cero', cnoDescripcion: 'C - Precio Cero' },
    { codigo: "I", descripcion: 'Última Compra', cnoDescripcion: 'I - Última Compra' },
    { codigo: "P", descripcion: 'Último Ingreso', cnoDescripcion: 'I - Último Ingreso' },];
  
// CUANDO HA SELECCIONADO "ÚLTIMA COMPRA" EN EL COMBO 1 Y HA SELECCIONADO "ÚLTIMO INGRESO" EN EL COMBO 2, ENTONCES LOS DATOS DEL COMBO 3 SON:
export const cb1_ultima_compra_cb2_ultimo_ingreso = [
  { codigo: "C", descripcion: 'Precio Cero', cnoDescripcion: 'C - Precio Cero' },
  { codigo: "P", descripcion: 'Precio Promedio', cnoDescripcion: 'P - Precio Promedio' }
]; 

// CUANDO HA SELECCIONADO "ÚLTIMA COMPRA" EN EL COMBO 1 Y HA SELECCIONADO "PRECIO PROMEDIO" EN EL COMBO 2, ENTONCES LOS DATOS DEL COMBO 3 SON:
export const cb1_ultima_compra_cb2_precio_promedio = [
  { codigo: "C", descripcion: 'Precio Cero', cnoDescripcion: 'C - Precio Cero' },
  { codigo: "P", descripcion: 'Último Ingreso', cnoDescripcion: 'P - Último Ingreso' }
];

// CUANDO HA SELECCIONADO "ÚLTIMO INGRESO" EN EL COMBO 1 Y HA SELECCIONADO "ULTIMA COMPRA" EN EL COMBO 2, ENTONCES LOS DATOS DEL COMBO 3 SON:
export const cb1_ultimo_ingreso_cb2_ultima_compra = [
  { codigo: "C", descripcion: 'Precio Cero', cnoDescripcion: 'C - Precio Cero' },
  { codigo: "P", descripcion: 'Precio Promedio', cnoDescripcion: 'P - Precio Promedio' }
]; 

// CUANDO HA SELECCIONADO "ÚLTIMO INGRESO" EN EL COMBO 1 Y HA SELECCIONADO "PRECIO PROMEDIO" EN EL COMBO 2, ENTONCES LOS DATOS DEL COMBO 3 SON:
export const cb1_ultimo_ingreso_cb2_precio_promedio = [
  { codigo: "C", descripcion: 'Precio Cero', cnoDescripcion: 'C - Precio Cero' },
  { codigo: "P", descripcion: 'Última Compra', cnoDescripcion: 'P - Última Compra' }
];

// CUANDO HA SELECCIONADO "PRECIO PROMEDIO" EN EL COMBO 1 Y HA SELECCIONADO "ULTIMA COMPRA" EN EL COMBO 2, ENTONCES LOS DATOS DEL COMBO 3 SON:
export const cb1_precio_promedio_cb2_ultima_compra = [
  { codigo: "C", descripcion: 'Precio Cero', cnoDescripcion: 'C - Precio Cero' },
  { codigo: "P", descripcion: 'Último Ingreso', cnoDescripcion: 'P - Último Ingreso' }
]; 
// CUANDO HA SELECCIONADO "PRECIO PROMEDIO" EN EL COMBO 1 Y HA SELECCIONADO "PRECIO PROMEDIO" EN EL COMBO 2, ENTONCES LOS DATOS DEL COMBO 3 SON:
export const cb1_precio_promedio_cb2_precio_promedio = [
  { codigo: "C", descripcion: 'Precio Cero', cnoDescripcion: 'C - Precio Cero' },
  { codigo: "P", descripcion: 'Última Compra', cnoDescripcion: 'P - Última Compra' }
];








