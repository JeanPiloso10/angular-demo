
export interface TipoUsoTransaccion {
  codigo: string;
  descripcion: string;
  cnoDescripcion: string;
  activo: boolean;
  usuarioCreacion?: string;
  fechaCreacion?: string;
  equipoCreacion?: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
  equipoModificacion?: string;
}
