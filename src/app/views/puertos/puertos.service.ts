import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '@core/services/base-crud.service'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PuertosService extends BaseCrudService {
  constructor(httpClient: HttpClient) {
    super(httpClient, 'puerto');
}

public tipoPuerto(): Observable<any> {
  const url = `${this.baseURL}tipoPuerto`;
  return this.httpClient.get<any>(url);
}

}
