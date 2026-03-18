import { Injectable } from '@angular/core';
import { BaseCrudService } from '@core/services/base-crud.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionPersonalizadaService extends BaseCrudService {

  constructor(httpClient: HttpClient) {
    super(httpClient, 'configuracionpersonalizada');
  }

  public listadoConfiguracion(codigoConfiguracion: any): Observable<any> {
    const url = `${this.apiURL}/listadoConfiguracion`;
    return this.httpClient.get<any>(`${url}/${codigoConfiguracion}`);
  }

  
}
