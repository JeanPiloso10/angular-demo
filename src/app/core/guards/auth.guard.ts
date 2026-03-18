
import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SecurityService } from '../services/security.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard{




  constructor(private securityService :SecurityService,
              private router :Router) {}


  private checkLoginAndRedirect(isOnline: boolean, state: RouterStateSnapshot): boolean | UrlTree {
    const isLoggedIn = this.securityService.isLoggedIn();
    const requiresTwoFactor = this.requiresTwoFactor();

    if ((state.url.includes('/verify-2fa') || 
         state.url.includes('/verify-alternative-auth') || 
         state.url.includes('/reset-password') ) && requiresTwoFactor) {
      return true;
    }
  
    if (!isLoggedIn || !isOnline) {
      // Redirigir al login si no hay sesión válida o si el servidor no está disponible
      return this.redirectToLogin(state.url);
    }
  
    return true;
  }


  private redirectToLogin(redirectURL: string): UrlTree {
    return this.router.parseUrl(`/login?redirectURL=${encodeURIComponent(redirectURL)}`);
  }

  private requiresTwoFactor(): boolean {
    const token = this.securityService.getToken();
    const twoFactor = localStorage.getItem('requiresTwoFactor');
    return !!token && twoFactor === 'true';
  }
  
  

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
   
      // Usar isLoggedIn() para verificar tanto la existencia del token como su validez/expiración
      if (!this.securityService.isLoggedIn()) {
        // Si no hay token válido, redirige directamente sin hacer llamadas al servidor.
        return of(this.redirectToLogin(state.url));
      }
      
      return this.securityService.checkServerStatus().pipe(
      map(isOnline => this.checkLoginAndRedirect(isOnline, state)),
      catchError(() => of(this.redirectToLogin(state.url))) // Maneja cualquier error
    );
  }
    canActivateChild(
      route: ActivatedRouteSnapshot, 
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(route, state); // Reutiliza canActivate para canActivateChild
  }
}