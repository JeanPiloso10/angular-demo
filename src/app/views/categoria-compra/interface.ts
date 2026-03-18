

  export interface tipoUnidad {
    codigo:number,
    descripcion:string,
    activo:boolean
  }

  export interface unidadMedida {
    idUnidadMedida:number,
    descripcion:string,
    abreviatura?:string,
    estado?:string,
    idTipoUnidad:number
  }