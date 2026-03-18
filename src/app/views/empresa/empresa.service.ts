import { Injectable } from '@angular/core';
import { BaseCrudService } from '@core/services/base-crud.service';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService extends BaseCrudService{
  
  private empresaUpdatedSource = new Subject<any>();
  empresaUpdated$ = this.empresaUpdatedSource.asObservable();

  constructor(httpClient: HttpClient) {
    super(httpClient, 'empresa');
  }
  notifyEmpresaUpdated(empresa: any) {
    this.empresaUpdatedSource.next(empresa);
  }
  public getEmpresa(): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL+ '/empresasUsuario'}`);
  }

  public listadoEmpresaSocioNegocio(idSocioNegocio: number): Observable<any> {
    const url = `${this.apiURL}${'/listadoEmpresaSocioNegocio'}`;
    return this.httpClient.get<any>(`${url}/${idSocioNegocio}`);
  }
  public GetSucursalesFromEmpresasByIdentificacion(identificacion: string): Observable<any> {
    const url = `${this.apiURL}${'/GetSucursalesFromEmpresasByIdentificacion'}`;
    return this.httpClient.get<any>(`${url}/${identificacion}`);
  }
  
}
