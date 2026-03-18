export interface NotificacionOperacionTransaccion {
    idNotificacionOperacionTransaccion?: number;
    codigoTransaccion?: string;
    codigoAccion?: string;
    codigoOperacion?: string;
    userName?: string;
    idSucursal?: number;
    codigoArea?: string;
    activo?: boolean;
    codigoCategoriaCompra?: string;
    codigoBodega?: string;
    esImportacion?: boolean;
    usuarioCreacionDocumentoOrigen?: string;
    usuarioAprobacionDocumentoOrigen?: string;
    codigoTipoCompra?: string;
}
