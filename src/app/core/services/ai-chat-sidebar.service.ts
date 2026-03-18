import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PermissionService } from './permission.service';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { Operacion } from '@shared/enums/Operacion';
import { OperacionesDto } from '@core/models/operaciones-dto';

@Injectable({ providedIn: 'root' })
export class AiChatSidebarService {
  private _visible$ = new BehaviorSubject<boolean>(false);
  private _hasAccess$ = new BehaviorSubject<boolean>(false);
  private _permissionsLoaded = false;

  public visible$ = this._visible$.asObservable();
  public hasAccess$ = this._hasAccess$.asObservable();

  private permissions: OperacionesDto[] = [];

  constructor(private permissionService: PermissionService) {}

  get isVisible(): boolean {
    return this._visible$.value;
  }

  get hasAccess(): boolean {
    return this._hasAccess$.value;
  }

  /** Load permissions for the analytics assistant transaction. Call once at app init. */
  async loadPermissions(): Promise<void> {
    if (this._permissionsLoaded) return;
    try {
      this.permissions = await this.permissionService.getPermissions(TransactionCode.asistenteAnalytics);
      const canRead = this.permissions.some(
        p => p.codigo?.toLowerCase() === Operacion.Leer.toLowerCase()
      );
      this._hasAccess$.next(canRead);
      this._permissionsLoaded = true;
    } catch {
      this._hasAccess$.next(false);
      // No marcar como cargado para permitir reintentos ante errores transitorios
    }
  }

  open(): void {
    if (!this._hasAccess$.value) return;
    this._visible$.next(true);
  }

  close(): void {
    this._visible$.next(false);
  }

  toggle(): void {
    if (!this._hasAccess$.value) return;
    this._visible$.next(!this._visible$.value);
  }

  setVisible(visible: boolean): void {
    if (visible && !this._hasAccess$.value) return;
    this._visible$.next(visible);
  }
}
