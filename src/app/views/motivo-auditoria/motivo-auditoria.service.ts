import { Injectable } from '@angular/core';
import { BaseCrudService } from '@core/services/base-crud.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MotivoAuditoriaService extends BaseCrudService {
  // Subject para emitir actualizaciones cuando se crea o modifica una línea de producto
  private actualizarDataSubject = new Subject<void>();
  // Observable al que los componentes se pueden suscribir
  dataActualizada$ = this.actualizarDataSubject.asObservable();

  constructor(httpClient: HttpClient) {
    super(httpClient, 'motivoAuditoria');
  }
  notificarActualizacion() {
    this.actualizarDataSubject.next();
  }

  getMotivoAuditoria(codigoTransaccion?: String): Observable<any> {
    const purl = `${this.apiURL}/ListadoMotivoAuditoria/${codigoTransaccion}`;
    return this.httpClient.get(purl);
  }

  public getGenerarId(): Observable<any> {
    const url = `${this.apiURL}${'/GenerarId'}`;
    return this.httpClient.get<any>(`${url}`);
  }

  public getMotivoAuditoriaFilter(motivoAuditoriaItemQuery: string): Observable<any> {
    const params = new HttpParams().set('motivoAuditoriaItemQuery', motivoAuditoriaItemQuery);
    return this.httpClient.get<any>(`${this.apiURL}/GetMotivoAuditoriaFilter`, { params });
  }
}
