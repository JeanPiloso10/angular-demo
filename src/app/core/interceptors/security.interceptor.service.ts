import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SecurityService } from '../services/security.service';
import { ModalHelperService } from '../services/modal-helper.service';
import { LogoutService } from '../services/logout.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityInterceptorService implements HttpInterceptor {

  // Flag de instancia para evitar múltiples redirecciones
  private isHandling401 = false;

  constructor(
    private router: Router,
    private securityService: SecurityService,
    private modalHelperService: ModalHelperService,
    private logoutService: LogoutService
  ) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.securityService.getToken();
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 0) {
          // Para errores de red o CORS (estado 0)
          const customError = new Error('No se puede establecer conexión con el servidor. Por favor, verifique su conexión a internet o contacte con soporte técnico.');
          customError.name = "ConnectionError";
          return throwError(() => customError);
        }
        else if (error instanceof HttpErrorResponse) {          
          this.handleHttpErrorResponse(error);
        } else {
          console.error('Something else happened', error);
        }
        return throwError(() => error);
      })
    );
  }

  private handleHttpErrorResponse(error: HttpErrorResponse): void {
    // Para errores 401: limpiar sesión, mostrar 401 y luego ir a login
    if (error.status === 401) {
      // Evitar múltiples redirecciones simultáneas
      if (this.isHandling401) {
        return;
      }
      this.isHandling401 = true;

      // Cerrar modales abiertos
      if (this.modalHelperService.isModalOpen) {
        this.modalHelperService.closeModals();
      }

      // Guardar la URL actual para redirigir después del login
      const currentUrl = this.router.url;

      // Limpiar sesión completa (SignalR, caché, token, etc.) - sin navegar, el interceptor maneja la navegación
      this.logoutService.logout(false, false);

      // Mostrar página 401 y luego redirigir a login con la URL de retorno
      this.router.navigate(['/401']).then(() => {
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { redirectURL: currentUrl } }).finally(() => {
            this.isHandling401 = false;
          });
        }, 3000);
      }).catch(() => {
        // Si falla la navegación a 401, ir directo a login
        this.router.navigate(['/login'], { queryParams: { redirectURL: currentUrl } }).finally(() => {
          this.isHandling401 = false;
        });
      });
      return;
    }

    // Otros errores HTTP
    const redirectMap: { [key: number]: string } = {
      403: '/403',
      500: '/500'
    };

    const redirectPath = redirectMap[error.status];
    if (redirectPath) {
      this.router.navigate([redirectPath]);
    } else {
      console.error('Unhandled error', error);
    }
  }
}
