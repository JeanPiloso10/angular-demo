import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginRequestDto} from '../models/security'
import { Observable, of  } from 'rxjs';
import { environment } from '@environment/environment';
import { catchError, map, retry } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { formatearFecha, obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {



  apiURL = environment.apiURL + 'auth';
  private readonly tokenKey = 'token';
  private readonly username = 'username';
  private readonly llaveExpiracion = 'token-expiracion';
  private readonly sessionId = 'sessionId';
  private readonly requiresTwoFactor = 'requiresTwoFactor';

  private redirectUrl: string | null = null;

  constructor(private httpClient : HttpClient,
  private notificationService : NotificationService ) {

   }


  getToken(){

    return localStorage.getItem(this.tokenKey);
  }


  getUserName(){
    const userName = localStorage.getItem(this.username);
    return userName?userName:'';
  }



  isLoggedIn(): boolean{

    const token = localStorage.getItem(this.tokenKey);

    
    if (!token){
      return false;
    }


    const fechaActual = new Date(obtenerFechaEnHusoHorarioMinus5());
    const expiracion = localStorage.getItem(this.llaveExpiracion);
    const expiracionFecha = expiracion !== null ? new Date(expiracion) : fechaActual ;

    // console.log('fecha Actual:',fechaActual);
    // console.log('fecha Expiracion:',expiracionFecha);

    if (expiracionFecha <= fechaActual){
      this.logout();
      return false;
    }

    return true;
  }

  saveSession(result: any){

    
    let sessionId = localStorage.getItem(this.sessionId);
    if (!sessionId) {
        sessionId = this.generateGuid();
        localStorage.setItem(this.sessionId, sessionId);
    }

    localStorage.setItem(this.username, result.user.userName);
    localStorage.setItem(this.tokenKey, result.token);
    localStorage.setItem(this.llaveExpiracion,  formatearFecha(result.expiracion));

  }


  verifyTwoFactorAuth(data: any): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/verify-2fa`, data);
  }


  login(credenciales: LoginRequestDto): Observable<any>
  { 
    return this.httpClient.post<any>(this.apiURL + '/login', credenciales);
  }

  getMicrosoftLoginUrl(returnUrl: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/externallogin?provider=Microsoft&redirectURL=${encodeURIComponent(returnUrl)}`);
}

 // Método para intercambiar el código por el token de acceso
 exchangeCodeForToken(code: string, codeVerifier: string): Observable<any> {
  const url = `${this.apiURL}/api/auth/exchange-token`;
  
  const body = {
    code: code,
    codeVerifier: codeVerifier
  };

  return this.httpClient.post<any>(url, body);
}

 // Método para enviar el code_verifier al backend
 storeCodeVerifier(uuid:string , codeVerifier: string): Observable<any> {
  return this.httpClient.post(`${this.apiURL}/store-code-verifier`, { uuid, codeVerifier });
}

  logout() {
    localStorage.removeItem(this.sessionId);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.username);
    localStorage.removeItem(this.llaveExpiracion);
    localStorage.removeItem(this.requiresTwoFactor); // Elimina el estado de 2FA
  }

  checkServerStatus(): Observable<boolean> {
    
    
    return this.httpClient.get(this.apiURL+ '/checkServerStatus', { responseType: 'text' })
      .pipe(
        map(() => true),
        catchError(error => {
          this.notificationService.showServerError(); // Mostrar notificación de error
          return of(false);
        })
      );
  }

  forgotPassword(email: string): Observable<any> {
    let frontendUrl = `${window.location.origin}/#/reset-password`;
    return this.httpClient.post(`${this.apiURL}/forgot-password`, { email,frontendUrl });
  }

  resetPassword(data: any): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/reset-password`, data);
  }

  verifyAlternativeTwoFactorAuth(data: any): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/verify-alternative-2fa`, data);
  }

  confirmEmail(token: string, userName: string): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/confirm-email`, { token, userName });
  }

  
  requestAlternativeTwoFactorAuthentication(userId: string): Observable<any> {
    return this.httpClient.post(`${this.apiURL}/request-alternative-2fa`, { userId });
  }

  setRedirectUrl(url: string) {
    this.redirectUrl = url;
  }

  getRedirectUrl(): string | null {
    return this.redirectUrl;
  }

  clearRedirectUrl() {
    this.redirectUrl = null;
  }

  // Método para obtener el state y el code_challenge
  generateMicrosoftAuthConfig(ReturnUrl: string): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/generate-microsoft-auth-config`, {ReturnUrl});
  }

  generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


}
