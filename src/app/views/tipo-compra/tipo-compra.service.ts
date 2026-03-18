import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '@core/services/base-crud.service'
import { Observable } from 'rxjs';
import { DataCacheService } from '@core/services/data-cache.service'
import { StorageType } from '@shared/enums/StorageType';

@Injectable({
  providedIn: 'root'
})
export class TipoCompraService extends BaseCrudService {

  constructor(httpClient: HttpClient, private cacheService: DataCacheService) {
    super(httpClient, 'tipocompra');
  }

  GetTipoCompra():Observable<any>{
    const url = `${this.apiURL}/listado`;
    return this.cacheService.getData(url,StorageType.local);
  }
  
}
