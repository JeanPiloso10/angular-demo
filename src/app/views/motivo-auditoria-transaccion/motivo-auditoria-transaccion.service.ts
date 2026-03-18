import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseCrudService } from '../../core/services/base-crud.service'
import { Observable, Subject } from 'rxjs';
import { DataCacheService } from '../../core/services/data-cache.service';

@Injectable({
  providedIn: 'root'
})
export class MotivoAuditoriaTransaccionService  extends BaseCrudService {

   // Subject para emitir actualizaciones cuando se crea o modifica una línea de producto
   private actualizarDataSubject = new Subject<void>();
   // Observable al que los componentes se pueden suscribir
   dataActualizada$ = this.actualizarDataSubject.asObservable();
 
   constructor(httpClient: HttpClient) {
     super(httpClient, 'motivoAuditoriaTransaccion');
   }
 
   notificarActualizacion() {
     this.actualizarDataSubject.next();
   }
 
   public getGenerarId(): Observable<any> {
     const url = `${this.apiURL}${'/GenerarId'}`;
     return this.httpClient.get<any>(`${url}`);
   }
 
   public getMotivoAuditoriaFilter(motivoAuditoriaTransaccionItemQuery: string): Observable<any> {
     const params = new HttpParams().set('motivoAuditoriaTransaccionItemQuery', motivoAuditoriaTransaccionItemQuery);
     return this.httpClient.get<any>(`${this.apiURL}/GetMotivoAuditoriaTransaccionFilter`, { params });
   }

   public motivoAuditoriaTransaccion(codigoTransaccion: any): Observable<any> {
    const url = `${this.apiURL}/transaccion`;
    return this.httpClient.get<any>(`${url}/${codigoTransaccion}`);
  }
}
