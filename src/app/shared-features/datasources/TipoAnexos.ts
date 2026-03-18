
import { TipoAnexo as EnumTipoAnexo } from '@app/shared-features/enums/TipoAnexo';

export class TipoAnexo {
  codigo: string;
  descripcion: string;
  cnoDescripcion:string;
}

export let listadoTipoAnexos: TipoAnexo[] = [
  { codigo: EnumTipoAnexo.ATS, descripcion: "ATS", cnoDescripcion:'A - ATS'},
  { codigo: EnumTipoAnexo.REOC, descripcion: "REOC", cnoDescripcion:'R - REOC'},
];

