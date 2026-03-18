import { TransactionCode } from '../enums/TransactionCode';

export function obtenerRutaListaPrecios(codigoTransaccion: string): string {
  switch (codigoTransaccion) {
    case TransactionCode.listaPrecioMaterialEmpaque:
      return '/listaPrecios/material-empaque';
    case TransactionCode.listaPrecioTransporte:
      return '/listaPrecios/transporte';
    default:
      return '/listaPrecios';
  }
}
