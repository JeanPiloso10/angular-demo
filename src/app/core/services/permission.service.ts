import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, firstValueFrom, of, tap } from 'rxjs';
import { OperacionesDto } from './../models/operaciones-dto';
import { DataCacheService } from './data-cache.service';
import { StorageType } from '@shared/enums/StorageType';
import { CacheKeys } from '@shared/enums/CacheKeys';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  
  private readonly apiURL = environment.apiURL + 'user';

  constructor(private cacheService: DataCacheService,private httpClient : HttpClient) { }

  public getPermissionByTransaction(transactionCode: string): Observable<any> {
    const key = `${CacheKeys.permisosTransaccion}_${transactionCode}`;
    const url = `${this.apiURL}${'/getPermissionByTransaction'}`;

    if (this.cacheService.hasCache(key)) {
      return of(this.cacheService.getCache(key));
    } else {
      // Obtener configuración y almacenar en caché
      return this.httpClient.get<any>(`${url}/${transactionCode}`).pipe(
        tap(response => this.cacheService.setCache(key, response))
      );
    }

  }


  async getPermissions(transactionCode: string): Promise<OperacionesDto[]> {
    try {
      const responsePermissions: any = await firstValueFrom(this.getPermissionByTransaction(transactionCode));
      if (responsePermissions.isSuccess) {
        return responsePermissions.result as OperacionesDto[];
      } else {
        return [];
      }
    } catch (error) {
      throw error;
    }
  }

}
