import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseCrudService } from '@app/core/services/base-crud.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorlogService extends BaseCrudService {

  constructor(httpClient: HttpClient) {
    super(httpClient, 'errorlog');
  }

  public BusquedaExceptionErrorLog(resource: any): Observable<any> {
    const purl = `${this.apiURL}/BusquedaExceptionErrorLog`;
    return this.httpClient.post(purl, resource);
  }

 
}
