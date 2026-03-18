export interface CalificacionTransaccionDto {
    identificacionPrincipal?: number;
    codigoTransaccion?:string;
    userNameCalifica?:string;
    calificacion?:number;
    promedio?:number;
    observacion?:string;
    activo?:boolean;
    usuarioCreacion?:string;
    fechaCreacion?:string;
    equipoCreacion?: string;
}