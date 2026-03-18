export class ReporteDto {
  idReporte?: number;
  codigoTransaccion?: string;
  idSucursal?: number;
  referencia1?: string;
  referencia2?: string;
  referencia3?: string;
  originalFileName?: string;
  fileName?: string;
  blobUri?: string;
  uploadDate?: Date;
  parameters?: { [key: string]: any };
  json?: { [key: string]: any };
}
