import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Servicio centralizado para la gestión de accesos.
 * Reutiliza los endpoints existentes del backend.
 */
@Injectable({
  providedIn: 'root'
})
export class GestionAccesosService {

  private readonly apiURL = environment.apiURL;

  constructor(private http: HttpClient) {}

  // ── Usuarios ──
  obtenerUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiURL}user`);
  }

  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}user/${id}`);
  }

  crearUsuario(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiURL}user`, data);
  }

  editarUsuario(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiURL}user/${id}`, data);
  }

  buscarUsuarioPorUsername(userName: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}user/GetUserAndRolesByName/${userName}`);
  }

  filtrarUsuarios(userQuery: string): Observable<any> {
    const params = new HttpParams().set('userQuery', userQuery);
    return this.http.get<any>(`${this.apiURL}user/GetUserFilter`, { params });
  }

  // ── Roles ──
  obtenerRoles(): Observable<any> {
    return this.http.get<any>(`${this.apiURL}role`);
  }

  crearRol(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiURL}role`, data);
  }

  // ── Permisos de usuario (sucursales / bodegas) ──
  obtenerPermisosUsuario(userName: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}permisoUsuario/obtenerPermisoUsuarioPorId/${userName}`);
  }

  copiarPermisos(data: { userNameOrigen: string, userNameDestino: string }): Observable<any> {
    return this.http.post<any>(`${this.apiURL}permisoUsuario/copiarPermisos`, data);
  }

  asignarPermisosMasivo(data: { codigoTransaccion: string, referencia1: string, usuarios: { userName: string, asignar: boolean }[] }): Observable<any> {
    return this.http.post<any>(`${this.apiURL}permisoUsuario/asignarPermisosMasivo`, data);
  }

  // ── Catálogos ──
  obtenerSucursales(): Observable<any> {
    return this.http.get<any>(`${this.apiURL}sucursal`);
  }

  obtenerBodegas(): Observable<any> {
    return this.http.get<any>(`${this.apiURL}bodega`);
  }

  obtenerAreas(): Observable<any> {
    return this.http.get<any>(`${this.apiURL}area/listado`);
  }

  // ── Áreas de usuario ──
  obtenerAreasUsuario(userName: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}user/obtenerAreasUsuario/${userName}`);
  }

  asignarAreasMasivo(data: { codigoArea: string, esPredeterminada: boolean, usuarios: { userName: string, asignar: boolean }[] }): Observable<any> {
    return this.http.post<any>(`${this.apiURL}user/asignarAreasMasivo`, data);
  }

  // ── Roles de usuario (masivo) ──
  obtenerUsuariosPorRol(roleIds: string): Observable<any> {
    const params = new HttpParams().set('roleIds', roleIds);
    return this.http.get<any>(`${this.apiURL}user/GetUserNamesInRoles`, { params });
  }

  asignarRolesMasivo(data: { roleId: string, usuarios: { userName: string, asignar: boolean }[] }): Observable<any> {
    return this.http.post<any>(`${this.apiURL}user/asignarRolesMasivo`, data);
  }

  // ── 2FA ──
  desactivar2FA(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiURL}user/disable-2fa`, { userId });
  }

  // ── Set Password ──
  setPassword(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiURL}user/setPassword/${id}`, data);
  }

  // ── Carga inicial de catálogos ──
  cargarCatalogos(): Observable<{
    roles: any;
    usuarios: any;
    sucursales: any;
    bodegas: any;
    areas: any;
  }> {
    return forkJoin({
      roles: this.obtenerRoles(),
      usuarios: this.obtenerUsuarios(),
      sucursales: this.obtenerSucursales(),
      bodegas: this.obtenerBodegas(),
      areas: this.obtenerAreas()
    });
  }
}
