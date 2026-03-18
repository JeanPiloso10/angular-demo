import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable , inject} from '@angular/core';
import { environment } from '../../../environments/environment';
import { DataCacheService } from './data-cache.service';
import { StorageType } from '@app/shared-features/enums/StorageType';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseCrudService {

  protected baseURL: string;
  protected apiURL: string;

  constructor(protected httpClient: HttpClient,
     resourcePath: string) {
    this.baseURL = environment.apiURL;
    this.apiURL = `${environment.apiURL}${resourcePath}`;
  }

  public todos(): Observable<any> {
    return this.httpClient.get<any>(this.apiURL);
  }

  public buscar(filtro: string): Observable<any> {
    const url = `${this.apiURL}${'/buscar'}`;
    return this.httpClient.get<any>(`${url}/${filtro}`);
  }

  public consultaId(id: any): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/${id}`);
  }

  public existeId(id: any): Observable<any> {
    const url = `${this.apiURL}${'/existeId'}`;
    return this.httpClient.get<any>(`${url}/${id}`);
  }


  public crear(resource: any): Observable<any> {
  
    return this.httpClient.post(this.apiURL, resource);
  }

  public editar(id: any, resource: any): Observable<any> {
    return this.httpClient.put(`${this.apiURL}/${id}`, resource);
  }

  public borrar(id: any): Observable<any> {
    return this.httpClient.delete(`${this.apiURL}/${id}`);
  }
  public listado(): Observable<any> {
    const url = `${this.apiURL}${'/listado'}`;
    return this.httpClient.get<any>(`${url}`);
  }


}
