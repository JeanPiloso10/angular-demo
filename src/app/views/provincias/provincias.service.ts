import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '@core/services/base-crud.service'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProvinciasService extends BaseCrudService {
  constructor(httpClient: HttpClient) {
    super(httpClient, 'provincia');
  }

  public getByPais(codigoPais: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/ByPais/${codigoPais}`);
  }
}
