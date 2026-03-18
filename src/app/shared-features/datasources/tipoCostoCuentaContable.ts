
export class TipoCostoCuentaContable {
  codigo: string;
  descripcion: string;
  cnoDescripcion:string;
}


export let listadoTipoCostoCuentaContable: TipoCostoCuentaContable[] = [
  { codigo: "F", descripcion: "Fijo", cnoDescripcion: "F - Fijo" },  // Panacea = S
  { codigo: "V", descripcion: "Variable", cnoDescripcion: "V - Variable" } // Panacea = N
];