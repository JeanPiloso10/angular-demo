export interface SolicitudFirmaDto {
    idSolicitudFirma?: number;
    codigoTransaccion?: string;
    idSucursal?: number;
    codigoEntidad?: string;
    idDocumento?: number;
    anioDocumento?: number;
    controlDocumento?: number;
    tipoDocumento?: string;
    serieDocumento?: string;
    numeroDocumento?: number;
    referencia1?: string;
    referencia2?: string;
    referencia3?: string;
    referencia4?: string;
    idRolFirmanteDesignado?: string,
    usuarioFirmanteDesignado?: string;
    usuarioFirmanteReal?: string;
    ordenFirma?: number;
    firmado?: boolean;
    codigoTipoAprobador?: string,
    codigoEsquemaFirma?:string,
    fechaFirma?: Date;
    equipoFirma?: string;
    estado?:string,
    usuarioSolicitud?: string;
    fechaSolicitud?: Date;
    equipoSolicitud?: string;
};

export interface ConfiguracionFirmaDto {
    idConfiguracionFirma?: number;
    codigoTransaccion?: string;
    idSucursal?: number;
    tipoDocumento?: string;
    usuarioFirmante?: string;
    idRolFirmante?: string;
    referencia1?: string;
    referencia2?: string;
    referencia3?: string;
    codigoTipoAprobador?: string;
    montoMaximo?: number;
    usuarioFirmanteAlterno?: string;
    idRolFirmanteAlterno?: string;
    usuarioFirmanteSuperiorAlterno?: string;
    idRolFirmanteSuperiorAlterno?: string;
    ordenFirma?: number;
}

export interface ProcesoSolicitudFirmaDto{
    codigoTransaccion?: string;
    idSucursal?: number;
    anioDocumento?: number;
    controlDocumento?: number;
    tipoDocumento?: string;
    serieDocumento?: string;
    numeroDocumento?: number;
    idDocumento?: number;
    referencia1?: string;
    referencia2?: string;
    referencia3?: string;
    montoDocumento?: number;
    codigoEsquemaFirma?: string;
    userNameSolicitante?: string;
    userNameProcesoSolicitud?: string,
    fechaSolicitud?: string,
    configuracionFirma?: ConfiguracionFirmaDto;
};