import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, Subject, debounceTime, distinctUntilChanged, switchMap, finalize, firstValueFrom } from 'rxjs';
import { ComboBoxModule, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  SpinnerModule
} from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '@app/icons/icon-subset';
import { GestionAccesosService } from '../gestion-accesos.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TransactionCode } from '@shared/enums/TransactionCode';

@Component({
  selector: 'app-copiar-permisos-dialog',
  templateUrl: './copiar-permisos-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ComboBoxModule,
    ButtonModule,
    CardModule,
    FormModule,
    GridModule,
    SpinnerModule,
    IconModule
  ],
  providers: [
    {
      provide: IconSetService,
      useFactory: () => {
        const iconSet = new IconSetService();
        iconSet.icons = { ...iconSubset };
        return iconSet;
      }
    }
  ]
})
export class CopiarPermisosDialogComponent {

  // Input: userName del usuario destino (se asigna desde el componente que abre el modal)
  userNameDestino: string = '';

  // ComboBox de usuarios
  cbUsuarios: any[] = [];
  fieldsUsuario: Object = { text: 'userName', value: 'userName' };
  searchUserTextChanged = new Subject<string>();
  isLoadingSearchUser = false;

  // Usuario origen seleccionado
  usuarioOrigenSeleccionado: any = null;

  // Preview de permisos
  permisosOrigen: any[] = [];
  sucursalesOrigen: string[] = [];
  bodegasOrigen: string[] = [];
  areasOrigen: any[] = [];
  permisosCargados = false;
  cargandoPermisos = false;

  loading = false;

  constructor(
    private activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private gestionService: GestionAccesosService
  ) {
    this.initDebounce();
  }

  // ── Debounce para filtrar usuarios ──

  private initDebounce(): void {
    this.searchUserTextChanged.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(query => {
        this.isLoadingSearchUser = true;
        return this.gestionService.filtrarUsuarios(query).pipe(
          catchError(() => of(null)),
          finalize(() => this.isLoadingSearchUser = false)
        );
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          this.cbUsuarios = response.result || response;
        }
      }
    });
  }

  onFilteringUsuario(event: FilteringEventArgs): void {
    const query = event.text;
    if (query.length >= 3 && !this.isLoadingSearchUser) {
      this.searchUserTextChanged.next(query);
    }
  }

  async onUsuarioOrigenChange(event: any): Promise<void> {
    this.permisosCargados = false;
    this.sucursalesOrigen = [];
    this.bodegasOrigen = [];
    this.areasOrigen = [];

    if (!event.isInteracted || !event.itemData) {
      this.usuarioOrigenSeleccionado = null;
      return;
    }

    this.usuarioOrigenSeleccionado = event.itemData;
    await this.cargarPermisosOrigen(this.usuarioOrigenSeleccionado.userName);
  }

  private async cargarPermisosOrigen(userName: string): Promise<void> {
    this.cargandoPermisos = true;
    try {
      const [permisosResp, areasResp]: any[] = await Promise.all([
        firstValueFrom(this.gestionService.obtenerPermisosUsuario(userName)),
        firstValueFrom(this.gestionService.obtenerAreasUsuario(userName))
      ]);

      // Parsear permisos
      const permisos = permisosResp || [];
      this.sucursalesOrigen = permisos
        .filter((p: any) => p.codigoTransaccion === TransactionCode.sucursal)
        .map((p: any) => p.referencia1);
      this.bodegasOrigen = permisos
        .filter((p: any) => p.codigoTransaccion === TransactionCode.bodega)
        .map((p: any) => p.referencia1);

      // Parsear áreas
      const areas = areasResp?.result || areasResp || [];
      this.areasOrigen = areas;

      this.permisosCargados = true;
    } catch (error) {
      this.toastr.error('Error al cargar permisos: ' + cadenaErrores(error));
    } finally {
      this.cargandoPermisos = false;
    }
  }

  aceptar(): void {
    if (!this.usuarioOrigenSeleccionado) {
      this.toastr.warning('Debe seleccionar un usuario origen.');
      return;
    }

    if (this.usuarioOrigenSeleccionado.userName === this.userNameDestino) {
      this.toastr.warning('El usuario origen no puede ser el mismo que el destino.');
      return;
    }

    // Retornar datos al componente padre para que ejecute la copia con confirmación
    this.activeModal.close({
      userNameOrigen: this.usuarioOrigenSeleccionado.userName,
      userNameDestino: this.userNameDestino,
      sucursales: this.sucursalesOrigen.length,
      bodegas: this.bodegasOrigen.length,
      areas: this.areasOrigen.length
    });
  }

  cerrar(): void {
    if (this.loading) {
      this.toastr.warning('Espere a que se complete la operación.');
      return;
    }
    this.activeModal.dismiss();
  }
}
