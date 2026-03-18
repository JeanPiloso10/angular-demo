import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfiguracionFirmaDto } from '@core/models/proceso-solicitud-firma-dto';
import { BaseCrudService } from '@core/services/base-crud.service';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionFirmaService extends BaseCrudService {


  constructor(httpClient: HttpClient) {
      super(httpClient, 'configuracionFirma');
  }

    public ObtenerListadoFirma(configuracionFirmaDto: ConfiguracionFirmaDto): Observable<any> {
    const url = `${this.apiURL}/ObtenerListadoFirma`;
    return this.httpClient.post<any>(url, configuracionFirmaDto);
  }

}
