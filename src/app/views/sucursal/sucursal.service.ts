import { Injectable } from '@angular/core';
import { BaseCrudService } from '@core/services/base-crud.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { DataCacheService } from '@core/services/data-cache.service';
import { ConfiguracionPersonalizadaDto } from '@core/models/configuracion-personalizada-dto';
import { Configuracion } from '@shared/enums/Configuracion';
import { SecurityService } from '@core/services/security.service';
import { ConfiguracionesService } from '@core/services/configuraciones.service';
import { CacheKeys } from '../../shared-features/enums/CacheKeys'
import { StorageType } from '@shared/enums/StorageType';

@Injectable({
  providedIn: 'root'
})
export class SucursalService extends BaseCrudService{

  constructor(httpClient: HttpClient, 
            private cacheService: DataCacheService,
            private securityService: SecurityService,
            private configuracionesService: ConfiguracionesService) {
    super(httpClient, 'sucursal');
  }
  public sucursalesUsuario(): Observable<any> {
    const url = `${this.apiURL}/sucursalesUsuario`;
    return this.cacheService.getData(url);
  }

  public sucursalPorDefecto(): Observable<any> {
   
    // Verificar si la configuración ya está en caché
    if (this.cacheService.hasCache(CacheKeys.sucursalPorDefecto)) {
      return of(this.cacheService.getCache(CacheKeys.sucursalPorDefecto));
    } else {

      const configuracionPersonalizada: ConfiguracionPersonalizadaDto = {
        codigoConfiguracion: Configuracion.SUCURSAL,
        userName: this.securityService.getUserName()
      };
      // Obtener configuración y almacenar en caché
      return this.configuracionesService.obtenerConfiguracion(configuracionPersonalizada).pipe(
        tap(configuracion => this.cacheService.setCache(CacheKeys.sucursalPorDefecto, configuracion))
      );
    }
  }

  public clearCacheSucursalPorDefecto(){
    this.cacheService.clearCache(CacheKeys.sucursalPorDefecto);
  }

}
