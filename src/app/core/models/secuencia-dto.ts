export interface SecuenciaDto {
    idSecuencia?: number;
    codigoTransaccion: string;
    idSucursal?: number;
    tipoSecuencia?: string;
    serieDocumento?: string;
    numeroDocumento?: number;
    anioDocumento?: number;
    tipoDocumento?: string;
    referenciaDocumento?: string;
    activo?: boolean;
    usuarioCreacion?: string;
    fechaCreacion?: string;
    equipoCreacion?: string;
    usuarioModificacion?: string;
    fechaModificacion?: string;
    equipoModificacion?: string;
  }