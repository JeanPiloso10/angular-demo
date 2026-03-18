import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseCrudService } from '@core/services/base-crud.service';
import { DataCacheService } from '@core/services/data-cache.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseCrudService {

  private readonly username = 'username';

  menu = environment.menu;

  constructor(httpClient: HttpClient, private cacheService: DataCacheService) {
    super(httpClient, 'user');
  }

  public newPassword(id: string, user: any) {
    return this.httpClient.put(`${this.apiURL + '/newPassword'}/${id}`, user);
  }

  public setPassword(id: string, user: any) {
    return this.httpClient.put(`${this.apiURL + '/setPassword'}/${id}`, user);
  }

  getMenuUsuario(): Observable<any> {
    let params = new HttpParams();
    params = params.append('username', this.getUserName());
    params = params.append('menu_id', this.menu);
    return this.httpClient.get<any>(this.apiURL + '/getMenuUsuario', { observe: 'response', params });
  }


  getProfilePic(): Observable<Blob> {
    return this.httpClient.get(`${this.apiURL}/getProfilePic`, { responseType: 'blob' });
  }

  public changeProfilePic(file: any) {

    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders();

    return this.httpClient.put(this.apiURL + '/changeProfilePic', formData, { headers: headers });
  };


  enableTwoFactorAuth(): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/enable-2fa`, {});
  }

  checkTwoFactorAuthStatus(): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/check-2fa-status`);
  }

  disableA2F(userId: string): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/disable-2fa`, { userId });
  }

  sendEmailConfirmation(): Observable<any> {

    let frontendUrl = `${window.location.origin}/#/confirm-email`;
    return this.httpClient.post(`${this.apiURL}/send-email-confirmation`, { frontendUrl });
  }

  public changePassword(changePassword: any) {
    return this.httpClient.put(`${this.apiURL + '/changePassword'}`, changePassword);
  }

  public isEmailConfirmed(): Observable<any> {
    return this.httpClient.post<any>(`${this.apiURL}/is-email-confirmed`, {});
  }

  public getAreaUsuario(): Observable<any> {
    const url = `${this.apiURL}/getAreaUsuario`;
    return this.cacheService.getData(url);
  }

  public getUserEmail(): Observable<any> {
    const url = `${this.apiURL}/GetUserEmail`;
    return this.cacheService.getData(url);
  }

  getUserName(): any {
    return localStorage.getItem(this.username);
  }

  public consultaUserNameYRoles(userName: any): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/GetUserAndRolesByName/${userName}`);
  }

  public consultaUserName(userName: any): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/${userName}`);
  }
  public getAprobadoresPorArea(userName: string, codigoTransaccion: string): Observable<any> {
    const url = `${this.apiURL}/ObtenerAprobadoresPorAreaAsync/${userName}/${codigoTransaccion}`;
    return this.cacheService.getData(url);
  }

  public GetUserFilter(userQuery: string): Observable<any> {
    const params = new HttpParams()
      .set('userQuery', userQuery);

    return this.httpClient.get<any>(`${this.apiURL}/GetUserFilter`, { params });
  }
  public GetUsersByUsernames(userName: any): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/GetUsersByUsernames`, {
      params: { usernames: userName }
    });
  }

  public GetUserNamesInRoles(roleIds: string): Observable<any> {
    const params = new HttpParams().set('roleIds', roleIds);
    return this.httpClient.get<any>(`${this.apiURL}/GetUserNamesInRoles`, { params });
  }

}
