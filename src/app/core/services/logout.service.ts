import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from './security.service';
import { DataCacheService } from './data-cache.service';
import { SignalrNotificationService } from './signalR/signalr-notification.service';
import { SpinnerService } from './spinner.service';

/**
 * Servicio centralizado para manejar el logout.
 * Coordina la limpieza de todos los recursos: SignalR, caché, localStorage, Service Worker.
 * 
 * Usar este servicio en lugar de llamar directamente a securityService.logout()
 * para garantizar una limpieza completa de la sesión.
 */
@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor(
    private router: Router,
    private securityService: SecurityService,
    private cacheService: DataCacheService,
    private signalrNotificationService: SignalrNotificationService,
    private spinnerService: SpinnerService
  ) {}

  /**
   * Ejecuta el logout completo con limpieza de todos los recursos.
   * @param showSpinner - Si debe mostrar el spinner durante el proceso (default: false)
   * @param navigateToLogin - Si debe navegar al login después del logout (default: true)
   *                          Usar false cuando el llamador maneja su propia navegación (ej: interceptor 401)
   */
  logout(showSpinner: boolean = false, navigateToLogin: boolean = true): void {
    try {
      if (showSpinner) {
        this.spinnerService.showGlobalSpinner();
      }

      // 1. Detener SignalR ANTES de limpiar el token
      // Esto evita que SignalR intente reconectar con token inválido
      this.signalrNotificationService.stopConnection();

      // 2. Limpiar caché de datos de la aplicación
      this.cacheService.clearAllCache();

      // 3. Limpiar datos específicos del localStorage
      this.clearLocalStorageData();

      // 4. Cerrar sesión (limpia token y datos de usuario)
      this.securityService.logout();

      // 5. Limpiar caché del Service Worker para datos dinámicos
      this.clearServiceWorkerCache();

      if (showSpinner) {
        this.spinnerService.hideGlobalSpinner();
      }

      // 6. Navegar al login (solo si se solicita)
      if (navigateToLogin) {
        this.router.navigate(['/login']);
      }

    } catch (error) {
      console.error('Error durante el logout:', error);
      
      if (showSpinner) {
        this.spinnerService.hideGlobalSpinner();
      }
      
      // Aún así limpiar el token
      this.securityService.logout();
      
      // Navegar al login solo si se solicita
      if (navigateToLogin) {
        this.router.navigate(['/login']);
      }
    }
  }

  /**
   * Limpia datos específicos del localStorage que no son manejados por otros servicios.
   */
  private clearLocalStorageData(): void {
    // Notificaciones
    localStorage.removeItem('lastNotificationId');
    
    // Agregar aquí otros items de localStorage específicos de la sesión
    // que deban limpiarse al cerrar sesión
  }

  /**
   * Limpia el caché del Service Worker para datos dinámicos.
   * No elimina assets estáticos para evitar re-descargas innecesarias.
   */
  private clearServiceWorkerCache(): void {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          // Solo limpiar cachés de datos dinámicos, no assets estáticos
          if (cacheName.includes('api') || cacheName.includes('dynamic') || cacheName.includes('data')) {
            caches.delete(cacheName);
          }
        });
      }).catch(error => {
        console.error('Error limpiando caché del Service Worker:', error);
      });
    }
  }
}
