import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BaseCrudService } from '@core/services/base-crud.service'


@Injectable({
  providedIn: 'root'
})
export class PermisoRolService  extends BaseCrudService {
 
  constructor(httpClient: HttpClient) {
    super(httpClient, 'permisorol');
  }

  guardar(permissions: any): Observable<any> {
    return this.httpClient.post(this.apiURL, permissions);
  }

}
