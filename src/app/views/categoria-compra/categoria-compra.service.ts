import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '@core/services/base-crud.service'
import { DataCacheService } from '@core/services/data-cache.service';
import { StorageType } from '@shared/enums/StorageType';
import { Observable, of, Subject, tap } from 'rxjs';
import { CacheKeys } from '@app/shared-features/enums/CacheKeys';
import { ConfiguracionesService } from '@core/services/configuraciones.service';
import { Configuracion } from '@shared/enums/Configuracion';
import { ConfiguracionPersonalizadaDto } from '@app/core/models/configuracion-personalizada-dto';

@Injectable({
  providedIn: 'root'
})
export class CategoriaCompraService extends BaseCrudService {

  // Subject para emitir actualizaciones cuando se crea o modifica una línea de producto
  private actualizarDataSubject = new Subject<void>();
  // Observable al que los componentes se pueden suscribir
  dataActualizada$ = this.actualizarDataSubject.asObservable();


  constructor(httpClient: HttpClient, private cacheService: DataCacheService, private configuracionesService: ConfiguracionesService) {
    super(httpClient, 'categoriacompra');
  }

  notificarActualizacion() {
    this.actualizarDataSubject.next();
  }

  ListadoCategoriaCompra(): Observable<any> {
    const url = `${this.apiURL}/ListadoCategoriaCompra`;
    return this.cacheService.getData(url);
    // return this.httpClient.get(url)
  }

  public ListadoActivosCategoriaCompra(): Observable<any> {
    const url = `${this.apiURL}/listado`;
    return this.cacheService.getData(url);
  }

  public getCategoriaCompraListaPrecio(codigoTransaccion: string, idSucursal?: number): Observable<any> {
    const configuracionPersonalizada: ConfiguracionPersonalizadaDto = {
      codigoConfiguracion: Configuracion.LISTA_PRECIO_CATEGORIA_COMPRA_POR_DEFECTO,
      codigoTransaccion: codigoTransaccion,
      idSucursal: idSucursal
    };
    // Obtener configuración y almacenar en caché
    return this.configuracionesService.obtenerConfiguracion(configuracionPersonalizada);
  }


}
