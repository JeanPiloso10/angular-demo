export class TipoArchivoAnexo {
    idTipoArchivoAnexo: number;
    descripcion: string;
    activo: boolean;
    tipoArchivoAnexoTransaccion?: TipoArchivoAnexoTransaccion[];
}

export class TipoArchivoAnexoTransaccion {
    idTipoArchivoAnexoTransaccion: number;
    idTipoArchivoAnexo: number;
    codigoTransaccion: string;
    activo: boolean;
}

