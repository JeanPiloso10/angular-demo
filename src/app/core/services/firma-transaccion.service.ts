import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProcesoSolicitudFirmaDto } from '../models/proceso-solicitud-firma-dto';
import { DocumentoSolicitudFirmaPorIdDto } from '../models/documentoSolicitudFirmaPorIdDto';
import { ConfiguracionPersonalizadaDto } from '../models/configuracion-personalizada-dto';
import { Configuracion } from '@shared/enums/Configuracion';
import { ConfiguracionPersonalizadaService } from '@app/views/configuracion-personalizada/configuracion-personalizada.service';
import { ConfiguracionesService } from './configuraciones.service';
import { ResponseDto } from '../models/ResponseDto';

@Injectable({
  providedIn: 'root'
})
export class FirmaTransaccionService {

  
  private readonly apiURL = environment.apiURL + 'solicitudFirma';

  constructor(private configuracionesService: ConfiguracionesService,private httpClient: HttpClient) { }


  public generaSolicitudFirma(procesoSolicitud: ProcesoSolicitudFirmaDto): Observable<any> {
    const url = `${this.apiURL}/GeneraSolicitudFirma`;
    return this.httpClient.post<any>(url, procesoSolicitud);
  };

  public generaSolicitudFirmaPorLista(procesoSolicitud: ProcesoSolicitudFirmaDto[]): Observable<any> {
    const url = `${this.apiURL}/GeneraSolicitudFirmaPorLista`;
    return this.httpClient.post<any>(url, procesoSolicitud);
  };

    public obtenerSolicitudesFirmaPorId(documentos: DocumentoSolicitudFirmaPorIdDto[]): Observable<any> {
    const url = `${this.apiURL}/ObtenerSolicitudesFirmaPorId`;
    return this.httpClient.post<any>(url, documentos);
  };

  public esquemaFirmaTransaccion(codigoTransaccion: string, idSucursal: number): Observable<any> {
   
    const configuracionPersonalizada: ConfiguracionPersonalizadaDto = {
      codigoConfiguracion: Configuracion.ESQUEMA_FIRMA,
      codigoTransaccion: codigoTransaccion,
      idSucursal: idSucursal
    };
    // Obtener configuración y almacenar en caché
    return this.configuracionesService.obtenerConfiguracion(configuracionPersonalizada);
  }

  // Elimina un detalle de solicitud de firma por su id
  public eliminarSolicitudFirmaDet(idSolicitudFirmaDet: number): Observable<any> {
    const url = `${this.apiURL}/EliminarSolicitudFirmaDet/${idSolicitudFirmaDet}`;
    return this.httpClient.delete<any>(url);
  }

  // Sustituye un firmante designado por su alterno preconfigurado
  public sustituirFirmante(idSolicitudFirmaDet: number, usuarioAlterno: string | null, idRolAlterno: string | null, usuarioAsigna?: string | null): Observable<any> {
    const url = `${this.apiURL}/SustituirFirmante/${idSolicitudFirmaDet}`;
    return this.httpClient.put<any>(url, { usuarioAlterno, idRolAlterno, usuarioAsigna });
  }

  // Revierte una sustitución de firmante, restaurando el firmante original
  public revertirSustitucion(idSolicitudFirmaDet: number): Observable<any> {
    const url = `${this.apiURL}/RevertirSustitucion/${idSolicitudFirmaDet}`;
    return this.httpClient.put<any>(url, {});
  }

  aprobarPorEmail(request: { codigoTransaccion: string; idDocumento: number; idSucursal: number }): Observable<ResponseDto> {
    return this.httpClient.post<ResponseDto>(`${this.apiURL}/AprobarPorEmail`, request);
  }

  // Agrega un firmante adicional (centralizado para todas las transacciones)
  public agregarFirmanteAdicional(dto: any): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/AgregarFirmanteAdicional`, dto);
  }

  // Delega un firmante a su alterno (centralizado)
  public delegarFirmante(dto: any): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/DelegarFirmante`, dto);
  }

  // Revierte la delegación de un firmante (centralizado)
  public revertirDelegacionFirmante(dto: any): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/RevertirDelegacionFirmante`, dto);
  }

  // Notifica cambios de firmantes en el hub (centralizado)
  public notificarCambioFirmantesEnHub(codigoTransaccion: string, idDocumento: number): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/NotificarCambioFirmantesEnHub/${codigoTransaccion}/${idDocumento}`, null);
  }

}


