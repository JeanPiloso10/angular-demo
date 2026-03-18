import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfiguracionPersonalizadaDto } from './../models/configuracion-personalizada-dto';
import { CacheKeys } from '@shared/enums/CacheKeys';
import { DataCacheService } from './data-cache.service';
import { Configuracion } from '@shared/enums/Configuracion';
import { SecurityService } from './security.service';
import { obtenerFechaEnHusoHorarioMinus5 } from '@app/shared-features/utilities/formatearFecha';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionesService {

 
  private readonly apiURLConfiguracion = environment.apiURL + 'configuracion';
  private readonly apiURLConfiguracionPersonalizada = environment.apiURL + 'configuracionpersonalizada';

  constructor(private cacheService: DataCacheService,
    private securityService: SecurityService,
    private httpClient: HttpClient
  ) { }

  public obtenerValorPorDefecto(codigoConfiguracion: any): Observable<any> {
    const url = `${this.apiURLConfiguracion}${'/obtenerValorPorDefecto'}`;
    return this.httpClient.get<any>(`${url}/${codigoConfiguracion}`);
  }

  public obtenerConfiguracion(configuracionPersonalizada: ConfiguracionPersonalizadaDto): Observable<any> {
    const url = `${this.apiURLConfiguracionPersonalizada}/obtenerConfiguracion`;
    return this.httpClient.post<ConfiguracionPersonalizadaDto>(url, configuracionPersonalizada);
  }
 public busquedaConfiguracionPersonalizada(configuracionPersonalizada: ConfiguracionPersonalizadaDto): Observable<any> {
    const url = `${this.apiURLConfiguracionPersonalizada}/BusquedaConfiguracionPersonalizada`;
    return this.httpClient.post<ConfiguracionPersonalizadaDto>(url, configuracionPersonalizada);
  }
  public guardarConfiguracion(configuracionPersonalizada: ConfiguracionPersonalizadaDto): Observable<any> {
    const url = `${this.apiURLConfiguracionPersonalizada}/guardarConfiguracion`;
    return this.httpClient.post<ConfiguracionPersonalizadaDto>(url, configuracionPersonalizada);
  }

  public clearCacheConfiguracion(cacheKey: string) {
    this.cacheService.clearCache(cacheKey);
  }

  private obtenerConfiguracionConCache(key: string, configuracionDto: Partial<ConfiguracionPersonalizadaDto>): Observable<any> {
    // Verificar si la configuración ya está en caché
    if (this.cacheService.hasCache(key)) {
      return of(this.cacheService.getCache(key));
    } else {
      const configuracionPersonalizada: ConfiguracionPersonalizadaDto = {
        userName: this.securityService.getUserName(),
        ...configuracionDto // Permite que cualquier campo parcial se agregue aquí
      };
      return this.obtenerConfiguracion(configuracionPersonalizada).pipe(
        tap(configuracion => this.cacheService.setCache(key, configuracion))
      );
    }
  }

  public getNotificarCorreo(): Observable<any> {
    const key = CacheKeys.notificarCorreo;
    const configuracionDto: Partial<ConfiguracionPersonalizadaDto> = {
      codigoConfiguracion: Configuracion.NOTIFICAR_CORREO
    };
    return this.obtenerConfiguracionConCache(key, configuracionDto);
  }

 

  public confirmacionPreviaAprobar(): Observable<any> {
    const key = `${CacheKeys.confirmacionPrevia}`;
    const configuracionDto: Partial<ConfiguracionPersonalizadaDto> = {
      codigoConfiguracion: Configuracion.CONFIR_PREVIA,
      codigoTransaccion: null
    };
    return this.obtenerConfiguracionConCache(key, configuracionDto);
  }


  public autogenerarCodigosItems(): Observable<any> {
    const key = CacheKeys.autogenerarCodigosItems;
    const configuracionDto: Partial<ConfiguracionPersonalizadaDto> = {
      codigoConfiguracion: Configuracion.AUTOGENERAR_CODIGOS_ITEMS
    };
    return this.obtenerConfiguracionConCache(key, configuracionDto);
  }
  public autogenerarCodigosAuxiliarContable(): Observable<any> {
    const key = CacheKeys.autogenerarCodigosAuxiliarContable;
    const configuracionDto: Partial<ConfiguracionPersonalizadaDto> = {
      codigoConfiguracion: Configuracion.AUTOGENERAR_CODIGOS_AUXILIARCONTABLE
    };
    return this.obtenerConfiguracionConCache(key, configuracionDto);
  }

  // Función auxiliar para crear configuración personalizada
  public crearConfiguracion(config: Partial<ConfiguracionPersonalizadaDto>): ConfiguracionPersonalizadaDto {
    return {
      idConfiguracionPersonalizada: config.idConfiguracionPersonalizada || 0,
      codigoConfiguracion: config.codigoConfiguracion!,
      userName: this.securityService.getUserName(),
      idSucursal: config.idSucursal || null,
      referencia1: config.referencia1 || '',
      referencia2: config.referencia2 || '',
      valor: config.valor || '',
      activo: true,
      usuarioCreacion: this.securityService.getUserName(),
      fechaCreacion: obtenerFechaEnHusoHorarioMinus5(),
      usuarioModificacion: this.securityService.getUserName(),
      fechaModificacion: obtenerFechaEnHusoHorarioMinus5(),
    };
  }

  // Función auxiliar para guardar configuración y limpiar caché
  public async guardarYLimpiarCache(
    configuracion: ConfiguracionPersonalizadaDto,
    clearCacheFn: () => void,
    errorMsg: string
  ): Promise<void> {
    try {
      const response = await firstValueFrom(this.guardarConfiguracion(configuracion));
      if (response?.isSuccess) clearCacheFn();
    } catch (error) {
      throw (error);
    }
  }
  public mostrarTodosLosMovimientos(codigoTransaccion: string): Observable<any> {
    if (this.cacheService.hasCache(CacheKeys.mostrarTodosLosMovimientos)) {
      return of(this.cacheService.getCache(CacheKeys.mostrarTodosLosMovimientos));
    } else {
      const configuracionPersonalizada: ConfiguracionPersonalizadaDto = {
        codigoConfiguracion: Configuracion.MOSTRAR_TODOS_LOS_MOVIMIENTOS,
        codigoTransaccion: codigoTransaccion
      };
      // Obtener configuración y almacenar en caché
      return this.busquedaConfiguracionPersonalizada(configuracionPersonalizada).pipe(
        tap(configuracion => this.cacheService.setCache(CacheKeys.mostrarTodosLosMovimientos, configuracion))
      );
    }
  }


}
