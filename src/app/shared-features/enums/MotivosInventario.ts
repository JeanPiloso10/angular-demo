export enum TipoMotivo {
  Ingreso = 'I',
  Egreso= 'E'
}

export enum ModoMotivo {
  Usuario = 'U',
  Sistema = 'S'
}

export enum OrigenIngreso {
  Compras = 'P',
  DevolucionVenta = 'D',
  Otros= 'O'
}

export enum OrigenEgreso {
  Consumos = 'P',
  DevolucionCompra = 'D',
  Ventas = 'I',
  Otros = 'O' 
}

export enum ComprobanteContableEnum {
  IngresoOrdenCompra = 'C',
  DocumentoPorPagar = 'I'
}
export enum PrecioAutomaticoCombo1 {
  UltimaCompra = 'C',
  UltimoIngreso = 'I',
  PrecioPromedio = 'P'
}

export enum PrecioAutomaticoCombo2y3 {
  PrecioCero = 'C',
  UltimaCompra = 'I',
  PrecioPromedio = 'P'
}
export enum PrecioAutomaticoCombo3 {
  PrecioCero = 'C',
  UltimaCompra = 'I',
  PrecioPromedio = 'P'
}