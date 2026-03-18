import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatTransaccionService {

  private readonly apiURL = environment.apiURL + 'ChatTransaccion';

  constructor(private httpClient: HttpClient) {}

  public obtenerChatPorTransaccion(request: any): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/por-transaccion`, request);
  }

  public crearMensaje(request: any): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/mensaje`, request);
  }
}
