import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificacionOperacionTransaccion } from '@app/core/models/notificacion-operacion-transaccion-dto';
import { BaseCrudService } from '@core/services/base-crud.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionOperacionTransaccionService extends BaseCrudService {


  constructor(httpClient: HttpClient) {
    super(httpClient, 'notificacionOperacionTransaccion');
  }

  public ObtenerListadoNotificacionOperacionTransaccion(notificacionOperacionTransaccionDto: NotificacionOperacionTransaccion): Observable<any> {
    const url = `${this.apiURL}/ObtenerListadoNotificacionOperacionTransaccion`;
    return this.httpClient.post<any>(url, notificacionOperacionTransaccionDto);
  }
}
