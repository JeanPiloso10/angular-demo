export class TipoEmisionDocumento {
  codigo: string;
  descripcion: string;
  cnoDescripcion:string;
}
export class TipoAmbienteDocumento {
  codigo: string;
  descripcion: string;
  cnoDescripcion:string;
}

export let listadoTipoEmisionDocumentos: TipoEmisionDocumento[] = [
  { codigo: "E", descripcion: "ELECTRÓNICOS", cnoDescripcion:'E - ELECTRÓNICOS'},
  { codigo: "P", descripcion: "PREIMPRESOS", cnoDescripcion:'P - PREIMPRESOS'},
  { codigo: "A", descripcion: "AUTOIMPRESOS", cnoDescripcion:'A - AUTOIMPRESOS'},
];
export let listadoTipoAmbienteDocumentos: TipoAmbienteDocumento[] = [
  { codigo: "1", descripcion: "PRUEBA", cnoDescripcion:'1 - PRUEBA'},
  { codigo: "2", descripcion: "PRODUCCIÓN", cnoDescripcion:'2 - PRODUCCIÓN'},
];
