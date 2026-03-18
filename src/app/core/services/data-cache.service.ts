import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageType } from '@shared/enums/StorageType'
import { cadenaErrores } from '@shared/utilities/parsearErrores';

@Injectable({
  providedIn: 'root'
})
export class DataCacheService {

  private memoryCache = new Map<string, any>(); // Almacenamiento en memoria (RAM)

  constructor(private http: HttpClient) {}

  getData(url: string, storageType?: string): Observable<any> {
    // Primero, verifica si los datos están en memoria
    if (this.memoryCache.has(url)) {
      //console.log(`Datos obtenidos desde memoria para URL:`, url);
      return of(this.memoryCache.get(url));
    }

    // Luego, verifica si los datos están en el storage especificado
    const cachedData = this.getCache(url, storageType);
    if (cachedData) {
      //console.log(`Datos obtenidos desde ${storageType}Storage para URL:`, url);
      // Almacena los datos en memoria para acceso más rápido en el futuro
      this.memoryCache.set(url, cachedData);
      return of(cachedData);
    }

    // Si no están en caché, realiza la solicitud HTTP
    //console.log(`No se encontró en caché, realizando solicitud HTTP para URL:`, url);
    return this.http.get(url).pipe(
      tap(data => {
        //console.log(`Almacenando en memoria y ${storageType}Storage (si aplica) los datos para URL:`, url, data);
        this.memoryCache.set(url, data); // Almacena en memoria
        if (storageType) {
          this.setCache(url, data, storageType); // Almacena en el storage especificado
        }
      })
    );
  }

  postData(url: string, body: any, storageType?:string): Observable<any> {
    const cacheKey = `${url}_${JSON.stringify(body)}`;

    // Primero, verifica si los datos están en memoria
    if (this.memoryCache.has(cacheKey)) {
      //console.log(`Datos obtenidos desde memoria para clave:`, cacheKey);
      return of(this.memoryCache.get(cacheKey));
    }

    // Luego, verifica si los datos están en el storage especificado
    const cachedData = this.getCache(cacheKey, storageType);
    if (cachedData) {
      //console.log(`Datos obtenidos desde ${storageType}Storage para clave:`, cacheKey);
      // Almacena los datos en memoria para acceso más rápido en el futuro
      this.memoryCache.set(cacheKey, cachedData);
      return of(cachedData);
    }

    // Si no están en caché, realiza la solicitud HTTP POST
    //console.log(`No se encontró en caché, realizando solicitud HTTP POST para clave:`, cacheKey);
    return this.http.post(url, body).pipe(
      tap(data => {
        //console.log(`Almacenando en memoria y ${storageType}Storage (si aplica) los datos para clave:`, cacheKey, data);
        this.memoryCache.set(cacheKey, data); // Almacena en memoria
        if (storageType) {
          this.setCache(cacheKey, data, storageType); // Almacena en el storage especificado
        }
      })
    );
  }

  public clearCache(key: string, storageType?:string): void {
    //console.log(`Limpiando caché para clave: ${key} en memoria y ${storageType ? storageType + 'Storage' : ''}`);
    this.memoryCache.delete(key);
    if (storageType) {
      this.getStorage(storageType).removeItem(key);
    }
  }

  public clearAllCache(): void {
    try
    {
      //console.log('Limpiando todo el caché de memoria, localStorage y sessionStorage');
          
      this.memoryCache.clear();
      sessionStorage.clear();

      // Almacenar el valor de la clave que deseas mantener
      const temaPredeterminado = localStorage.getItem('coreui-free-angular-admin-template-theme-default');

      // Limpiar todo el localStorage
      localStorage.clear();

      // Restaurar el valor de la clave que deseas mantener
      if (temaPredeterminado) {
        localStorage.setItem('coreui-free-angular-admin-template-theme-default', temaPredeterminado);
      }

    }
    catch(error)
    {
      console.log(cadenaErrores(error));
    }
   
  }


  // Ahora estos métodos son públicos y manejan la búsqueda en memoria y almacenamiento persistente
  public hasCache(key: string, storageType?: string): boolean {
    return this.memoryCache.has(key) || (storageType ? this.getStorage(storageType).getItem(key) !== null : false);
  }

  public getCache(key: string, storageType?:string): any {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key); // Retorna desde memoria si está disponible
    }
    if (storageType) {
      const cachedData = this.getStorage(storageType).getItem(key);
      return cachedData ? JSON.parse(cachedData) : null;
    }
    return null;
  }

  public setCache(key: string, data: any, storageType?: string): void {
    //console.log(`Configurando caché para clave: ${key} en memoria y ${storageType || 'ningún'}Storage`, data);
    this.memoryCache.set(key, data); // Almacena en memoria
    if (storageType) {
      this.getStorage(storageType).setItem(key, JSON.stringify(data)); // Almacena en el storage especificado
    }
  }

  private getStorage(storageType: string): Storage {
    return storageType === StorageType.local ? localStorage : sessionStorage;
  }

}
