import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '@core/services/base-crud.service'
import { Observable } from 'rxjs';
import { DataCacheService } from '@core/services/data-cache.service';

@Injectable({
  providedIn: 'root'
})
export class CiudadesService extends  BaseCrudService {
  constructor(httpClient: HttpClient, private cacheService: DataCacheService) {
    super(httpClient, 'ciudad');
  }
  public getCiudad(ciudadQuery:string): Observable<any> {

    const url = `${this.apiURL}/GetCiudad/${ciudadQuery}`;
    return this.cacheService.getData(url);
  }

  public getByProvincia(codigoProvincia: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/ByProvincia/${codigoProvincia}`);
  }
}
