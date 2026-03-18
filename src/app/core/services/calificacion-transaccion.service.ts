import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalificacionTransaccionDto } from '../models/CalificacionTransaccion-dto'; // Asegúrate de que la ruta sea correcta
@Injectable({
  providedIn: 'root'
})
export class CalificacionTransaccionService {


  apiURL = environment.apiURL + 'CalificacionTransaccion';

  constructor(private httpClient: HttpClient) { }

  crear(data: CalificacionTransaccionDto): Observable<CalificacionTransaccionDto> {
    return this.httpClient.post<CalificacionTransaccionDto>(`${this.apiURL}`, data);
  }
  consulta(identificacionPrincipal?: number,  codigoTransaccion?: string): Observable<any> {
    const purl = `${this.apiURL}/GetCalitifacion/${identificacionPrincipal}/${codigoTransaccion}`;
    return this.httpClient.get(purl);
  }

}
