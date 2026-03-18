import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseCrudService } from '@core/services/base-crud.service'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesPushService extends BaseCrudService {

 
  constructor(httpClient: HttpClient) {
    super(httpClient, 'NotificacionPush');
  }

   // Método para obtener la cantidad de notificaciones no leídas
   obtenerCantidadNotificacionesNoLeidas(): Observable<{ cantidad: number }> {
    return this.httpClient.get<{ cantidad: number }>(`${this.apiURL}/CantidadNoLeidas`);
  }

  // Método para obtener las notificaciones no leídas
  obtenerNotificacionesNoLeidas(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.apiURL}/NoLeidas`);
  }

  marcarNotificacionesComoLeidas(): Observable<void> {
    const sessionId = localStorage.getItem('sessionId');
    const userAgent = navigator.userAgent;

    return this.httpClient.post<void>(`${this.apiURL}/MarcarComoLeidas`, { sessionId, userAgent });
}

  // Método para marcar una notificación como clickeada
marcarNotificacionComoClickeada(idNotificacionUsuario: number): Observable<void> {
  return this.httpClient.post<void>(`${this.apiURL}/MarcarNotificacionComoClickeada/${idNotificacionUsuario}`, {});
}

   // Método para obtener las notificaciones leídas paginadas
   obtenerNotificacionesLeidas(page: number, pageSize: number): Observable<any[]> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('pageSize', pageSize.toString());

    return this.httpClient.get<any[]>(`${this.apiURL}/Leidas`, { params });
  }

}
