import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {


  private readonly apiURL = environment.apiURL + 'AuditoriaLog';

  constructor(private httpClient: HttpClient) { }

  public obtenerAuditoria(codigoTransaccion: String, identificacionPrincipal: String, referencia1?: string): Observable<any> {
    let params = new HttpParams();
    if (referencia1?.trim()) {
      params = params.set('referencia1', referencia1.trim());
    }

    return this.httpClient.get<any>(
      `${this.apiURL}/ListadoAuditoria/${codigoTransaccion}/${identificacionPrincipal}`,
      { params }
    );
  }
}
