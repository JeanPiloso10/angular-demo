import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  menu = environment.menu;
  apiURL = environment.apiURL + 'menu';

  constructor(private httpClient: HttpClient) { }

  public todo(): Observable<any>{
    return this.httpClient.get<any>(`${this.apiURL}/${this.menu}`);
  }


  public arbol(): Observable<any>{
    return this.httpClient.get<any>(`${this.apiURL+ '/arbol'}/${this.menu}`);
  }

  public listado(): Observable<any>{
    return this.httpClient.get<any>(`${this.apiURL+ '/listado'}/${this.menu}`);
  }

  public crear(usuario: any) {
    return this.httpClient.post(this.apiURL, usuario);
  }

    public borrar(id: number) {
    return this.httpClient.delete(`${this.apiURL}/${id}`);
  }

  
  public editar(id: number, menu: any){
    return this.httpClient.put(`${this.apiURL}/${id}`, menu);
  }

  public consultaId(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL+ '/getid'}/${id}`);
  }


}
