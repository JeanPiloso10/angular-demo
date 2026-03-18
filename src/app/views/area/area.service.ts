import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseCrudService } from '@core/services/base-crud.service'
import { Observable, Subject } from 'rxjs';
import { DataCacheService } from '@core/services/data-cache.service';


@Injectable({
  providedIn: 'root'
})
export class AreasService extends BaseCrudService {

  // Subject para emitir actualizaciones cuando se crea o modifica una línea de producto
  private actualizarDataSubject = new Subject<void>();
  // Observable al que los componentes se pueden suscribir
  dataActualizada$ = this.actualizarDataSubject.asObservable();

  constructor(httpClient: HttpClient, private cacheService: DataCacheService) {
    super(httpClient, 'area');
  }

  notificarActualizacion() {
    this.actualizarDataSubject.next();
  }
  
  public getAreaFilter(areaItemQuery: string): Observable<any> {
    const params = new HttpParams().set('areaItemQuery', areaItemQuery);
    return this.httpClient.get<any>(`${this.apiURL}/GetAreaFilter`, { params });
  }
}
