import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import Swal from 'sweetalert2';

import { TransactionCode } from '@shared/enums/TransactionCode';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { SpinnerService } from '@core/services/spinner.service';
import { GestionAccesosService } from '../gestion-accesos.service';

interface UsuarioConPermisos {
  userName: string;
  fullName: string;
  tienePermiso: boolean;
  permisoOriginal: boolean;
}

@Component({
  selector: 'app-asignacion-masiva',
  templateUrl: './asignacion-masiva.component.html',
  styleUrl: './asignacion-masiva.component.scss',
  standalone: false
})
export class AsignacionMasivaComponent implements OnInit {

  form: FormGroup;

  // Catálogos
  tipoEntidades = [
    { codigo: 'SUCURSAL', descripcion: 'Sucursal' },
    { codigo: 'BODEGA', descripcion: 'Bodega' },
    { codigo: 'AREA_PRINCIPAL', descripcion: 'Área Principal' },
    { codigo: 'AREA_SECUNDARIA', descripcion: 'Área Secundaria' },
    { codigo: 'ROL', descripcion: 'Rol' }
  ];
  fieldsTipoEntidad: Object = { text: 'descripcion', value: 'codigo' };

  listadoSucursales: any[] = [];
  listadoBodegas: any[] = [];
  listadoAreas: any[] = [];
  listadoEntidades: any[] = [];
  fieldsEntidad: Object = {};
  fieldsSucursal: Object = { text: 'cnoSucursal', value: 'idSucursal' };
  fieldsBodega: Object = { text: 'cnoBodega', value: 'idBodega' };
  fieldsArea: Object = { text: 'cnoArea', value: 'codigo' };
  listadoRoles: any[] = [];
  fieldsRol: Object = { text: 'name', value: 'id' };

  // Usuarios con estado de permiso
  todosLosUsuarios: any[] = [];
  usuariosConPermisos: UsuarioConPermisos[] = [];
  usuariosSeleccionados: string[] = [];

  entidadSeleccionada: any = null;
  tipoSeleccionado: string = '';

  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private spinnerService: SpinnerService,
    private gestionService: GestionAccesosService
  ) {
    this.form = this.formBuilder.group({
      tipoEntidad: [''],
      entidad: [''],
      usuarios: [[]]
    });
  }

  async ngOnInit() {
    await this.cargarDatos();
  }

  private async cargarDatos() {
    try {
      this.spinnerService.showGlobalSpinner();
      const results = await firstValueFrom(forkJoin({
        usuarios: this.gestionService.obtenerUsuarios().pipe(catchError(() => of({ result: [] }))),
        sucursales: this.gestionService.obtenerSucursales().pipe(catchError(() => of({ result: [] }))),
        bodegas: this.gestionService.obtenerBodegas().pipe(catchError(() => of({ result: [] }))),
        areas: this.gestionService.obtenerAreas().pipe(catchError(() => of({ result: [] }))),
        roles: this.gestionService.obtenerRoles().pipe(catchError(() => of({ result: [] })))
      }));

      this.todosLosUsuarios = results.usuarios.result || [];
      this.listadoSucursales = results.sucursales.result || [];
      this.listadoBodegas = results.bodegas.result || [];
      this.listadoAreas = results.areas.result || [];
      this.listadoRoles = results.roles.result || [];
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  // ═══════════════════════════════════════════════
  //  CAMBIOS EN SELECCIÓN
  // ═══════════════════════════════════════════════

  onTipoEntidadChange(args: any): void {
    this.tipoSeleccionado = args?.value || args || '';
    this.entidadSeleccionada = null;
    this.usuariosConPermisos = [];
    this.form.patchValue({ entidad: '', usuarios: [] });

    if (this.tipoSeleccionado === 'SUCURSAL') {
      this.listadoEntidades = this.listadoSucursales;
      this.fieldsEntidad = this.fieldsSucursal;
    } else if (this.tipoSeleccionado === 'BODEGA') {
      this.listadoEntidades = this.listadoBodegas;
      this.fieldsEntidad = this.fieldsBodega;
    } else if (this.tipoSeleccionado === 'AREA_PRINCIPAL' || this.tipoSeleccionado === 'AREA_SECUNDARIA') {
      this.listadoEntidades = this.listadoAreas;
      this.fieldsEntidad = this.fieldsArea;
    } else if (this.tipoSeleccionado === 'ROL') {
      this.listadoEntidades = this.listadoRoles;
      this.fieldsEntidad = this.fieldsRol;
    } else {
      this.listadoEntidades = [];
      this.fieldsEntidad = {};
    }
  }

  async onEntidadChange(args: any) {
    const value = args?.value ?? args;
    if (!value || !this.tipoSeleccionado) {
      this.usuariosConPermisos = [];
      return;
    }

    this.entidadSeleccionada = value;

    if (this.esTipoRol) {
      await this.cargarUsuariosConRol();
    } else if (this.esTipoArea) {
      await this.cargarUsuariosConArea();
    } else {
      await this.cargarUsuariosConPermiso();
    }
  }

  get esTipoArea(): boolean {
    return this.tipoSeleccionado === 'AREA_PRINCIPAL' || this.tipoSeleccionado === 'AREA_SECUNDARIA';
  }

  get esTipoRol(): boolean {
    return this.tipoSeleccionado === 'ROL';
  }

  get labelEntidad(): string {
    switch (this.tipoSeleccionado) {
      case 'SUCURSAL': return 'Sucursal';
      case 'BODEGA': return 'Bodega';
      case 'AREA_PRINCIPAL':
      case 'AREA_SECUNDARIA': return 'Área';
      case 'ROL': return 'Rol';
      default: return 'Entidad';
    }
  }

  private async cargarUsuariosConPermiso() {
    const transactionCode = this.tipoSeleccionado === 'SUCURSAL'
      ? TransactionCode.sucursal
      : TransactionCode.bodega;

    this.spinnerService.showGlobalSpinner();
    try {
      // Cargar permisos de todos los usuarios en paralelo
      const permisosPromises = this.todosLosUsuarios.map(async (user: any) => {
        try {
          const permisos: any = await firstValueFrom(
            this.gestionService.obtenerPermisosUsuario(user.userName)
              .pipe(catchError(() => of([])))
          );

          const tienePermiso = (permisos || []).some((p: any) =>
            p.codigoTransaccion === transactionCode &&
            p.referencia1 === this.entidadSeleccionada.toString()
          );

          return {
            userName: user.userName,
            fullName: user.fullName || user.userName,
            tienePermiso,
            permisoOriginal: tienePermiso
          } as UsuarioConPermisos;
        } catch {
          return {
            userName: user.userName,
            fullName: user.fullName || user.userName,
            tienePermiso: false,
            permisoOriginal: false
          } as UsuarioConPermisos;
        }
      });

      this.usuariosConPermisos = await Promise.all(permisosPromises);
      // Ordenar: primero los que ya tienen permiso
      this.usuariosConPermisos.sort((a, b) => {
        if (a.tienePermiso === b.tienePermiso) return a.userName.localeCompare(b.userName);
        return a.tienePermiso ? -1 : 1;
      });

      // Preseleccionar los que ya tienen permiso
      this.usuariosSeleccionados = this.usuariosConPermisos
        .filter(u => u.tienePermiso)
        .map(u => u.userName);
      this.form.patchValue({ usuarios: this.usuariosSeleccionados });

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  private async cargarUsuariosConArea() {
    const codigoArea = this.entidadSeleccionada.toString();
    const esPrincipal = this.tipoSeleccionado === 'AREA_PRINCIPAL';

    this.spinnerService.showGlobalSpinner();
    try {
      const areasPromises = this.todosLosUsuarios.map(async (user: any) => {
        try {
          const response: any = await firstValueFrom(
            this.gestionService.obtenerAreasUsuario(user.userName)
              .pipe(catchError(() => of({ result: [] })))
          );

          const areas: any[] = response?.result || [];

          let tienePermiso = false;
          if (esPrincipal) {
            // Área Principal: el usuario tiene esta área asignada Y es predeterminada
            tienePermiso = areas.some((a: any) =>
              a.codigoArea === codigoArea && a.predeterminado === true
            );
          } else {
            // Área Secundaria: el usuario tiene esta área asignada (sin importar predeterminado)
            tienePermiso = areas.some((a: any) => a.codigoArea === codigoArea);
          }

          return {
            userName: user.userName,
            fullName: user.fullName || user.userName,
            tienePermiso,
            permisoOriginal: tienePermiso
          } as UsuarioConPermisos;
        } catch {
          return {
            userName: user.userName,
            fullName: user.fullName || user.userName,
            tienePermiso: false,
            permisoOriginal: false
          } as UsuarioConPermisos;
        }
      });

      this.usuariosConPermisos = await Promise.all(areasPromises);
      this.usuariosConPermisos.sort((a, b) => {
        if (a.tienePermiso === b.tienePermiso) return a.userName.localeCompare(b.userName);
        return a.tienePermiso ? -1 : 1;
      });

      this.usuariosSeleccionados = this.usuariosConPermisos
        .filter(u => u.tienePermiso)
        .map(u => u.userName);
      this.form.patchValue({ usuarios: this.usuariosSeleccionados });

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  private async cargarUsuariosConRol() {
    const roleId = this.entidadSeleccionada.toString();

    this.spinnerService.showGlobalSpinner();
    try {
      // Una sola llamada para obtener los usuarios que tienen el rol
      const response: any = await firstValueFrom(
        this.gestionService.obtenerUsuariosPorRol(roleId)
          .pipe(catchError(() => of({ result: [] })))
      );
      const usuariosConRol = new Set<string>(response?.result || []);

      this.usuariosConPermisos = this.todosLosUsuarios.map((user: any) => {
        const tienePermiso = usuariosConRol.has(user.userName);
        return {
          userName: user.userName,
          fullName: user.fullName || user.userName,
          tienePermiso,
          permisoOriginal: tienePermiso
        } as UsuarioConPermisos;
      });

      this.usuariosConPermisos.sort((a, b) => {
        if (a.tienePermiso === b.tienePermiso) return a.userName.localeCompare(b.userName);
        return a.tienePermiso ? -1 : 1;
      });

      this.usuariosSeleccionados = this.usuariosConPermisos
        .filter(u => u.tienePermiso)
        .map(u => u.userName);
      this.form.patchValue({ usuarios: this.usuariosSeleccionados });

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  // ═══════════════════════════════════════════════

  toggleUsuario(usuario: UsuarioConPermisos): void {
    usuario.tienePermiso = !usuario.tienePermiso;
    this.actualizarSeleccion();
  }

  seleccionarTodos(): void {
    this.usuariosConPermisos.forEach(u => u.tienePermiso = true);
    this.actualizarSeleccion();
  }

  deseleccionarTodos(): void {
    this.usuariosConPermisos.forEach(u => u.tienePermiso = false);
    this.actualizarSeleccion();
  }

  private actualizarSeleccion(): void {
    this.usuariosSeleccionados = this.usuariosConPermisos
      .filter(u => u.tienePermiso)
      .map(u => u.userName);
  }

  get hayCambios(): boolean {
    return this.usuariosConPermisos.some(u => u.tienePermiso !== u.permisoOriginal);
  }

  get cantidadSeleccionados(): number {
    return this.usuariosConPermisos.filter(u => u.tienePermiso).length;
  }

  get cantidadCambios(): number {
    return this.usuariosConPermisos.filter(u => u.tienePermiso !== u.permisoOriginal).length;
  }

  private obtenerLabelTipo(): string {
    switch (this.tipoSeleccionado) {
      case 'ROL': return 'asignaciones de rol';
      case 'AREA_PRINCIPAL':
      case 'AREA_SECUNDARIA': return 'asignaciones de área';
      default: return 'permisos';
    }
  }

  // ═══════════════════════════════════════════════
  //  GUARDAR
  // ═══════════════════════════════════════════════

  async guardarAsignacion() {
    if (!this.entidadSeleccionada || !this.tipoSeleccionado) {
      this.toastr.error('Seleccione el tipo de entidad y la entidad.');
      return;
    }

    if (!this.hayCambios) {
      this.toastr.info('No hay cambios que guardar.');
      return;
    }

    const labelTipo = this.obtenerLabelTipo();
    const result = await Swal.fire({
      title: 'Confirmar asignación masiva',
      html: `Se realizarán <b>${this.cantidadCambios}</b> cambio(s) de ${labelTipo}.<br>¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    if (this.esTipoRol) {
      await this.guardarAsignacionRoles();
    } else if (this.esTipoArea) {
      await this.guardarAsignacionAreas();
    } else {
      await this.guardarAsignacionPermisos();
    }
  }

  private async guardarAsignacionAreas() {
    const codigoArea = this.entidadSeleccionada.toString();
    const esPredeterminada = this.tipoSeleccionado === 'AREA_PRINCIPAL';
    const cambios = this.usuariosConPermisos.filter(u => u.tienePermiso !== u.permisoOriginal);

    this.spinnerService.showGlobalSpinner();
    try {
      const dto = {
        codigoArea,
        esPredeterminada,
        usuarios: cambios.map(u => ({
          userName: u.userName,
          asignar: u.tienePermiso
        }))
      };

      await firstValueFrom(this.gestionService.asignarAreasMasivo(dto));
      this.toastr.success(`Áreas actualizadas para ${cambios.length} usuario(s).`);

      // Refrescar estado
      await this.cargarUsuariosConArea();
    } catch (error) {
      this.toastr.error('Error al guardar: ' + cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  private async guardarAsignacionPermisos() {
    const transactionCode = this.tipoSeleccionado === 'SUCURSAL'
      ? TransactionCode.sucursal
      : TransactionCode.bodega;

    const cambios = this.usuariosConPermisos.filter(u => u.tienePermiso !== u.permisoOriginal);

    this.spinnerService.showGlobalSpinner();
    try {
      const dto = {
        codigoTransaccion: transactionCode,
        referencia1: this.entidadSeleccionada.toString(),
        usuarios: cambios.map(u => ({
          userName: u.userName,
          asignar: u.tienePermiso
        }))
      };

      await firstValueFrom(this.gestionService.asignarPermisosMasivo(dto));
      this.toastr.success(`Permisos actualizados para ${cambios.length} usuario(s).`);

      await this.cargarUsuariosConPermiso();
    } catch (error) {
      this.toastr.error('Error al guardar: ' + cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  private async guardarAsignacionRoles() {
    const roleId = this.entidadSeleccionada.toString();
    const cambios = this.usuariosConPermisos.filter(u => u.tienePermiso !== u.permisoOriginal);

    this.spinnerService.showGlobalSpinner();
    try {
      const dto = {
        roleId,
        usuarios: cambios.map(u => ({
          userName: u.userName,
          asignar: u.tienePermiso
        }))
      };

      await firstValueFrom(this.gestionService.asignarRolesMasivo(dto));
      this.toastr.success(`Roles actualizados para ${cambios.length} usuario(s).`);

      await this.cargarUsuariosConRol();
    } catch (error) {
      this.toastr.error('Error al guardar: ' + cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  // ═══════════════════════════════════════════════
  //  FILTROS
  // ═══════════════════════════════════════════════

  public onEntidadFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    let query = new Query();
    if (this.tipoSeleccionado === 'SUCURSAL') {
      query = e.text ? query.where('cnoSucursal', 'contains', e.text, true) : query;
    } else if (this.tipoSeleccionado === 'BODEGA') {
      query = e.text ? query.where('cnoBodega', 'contains', e.text, true) : query;
    } else if (this.tipoSeleccionado === 'AREA_PRINCIPAL' || this.tipoSeleccionado === 'AREA_SECUNDARIA') {
      query = e.text ? query.where('cnoArea', 'contains', e.text, true) : query;
    } else if (this.tipoSeleccionado === 'ROL') {
      query = e.text ? query.where('name', 'contains', e.text, true) : query;
    }
    e.updateData(this.listadoEntidades, query);
  };

  // ═══════════════════════════════════════════════
  //  NAVEGACIÓN
  // ═══════════════════════════════════════════════

  volverAUsuario(): void {
    this.router.navigate(['/gestionaccesos']);
  }

  // Filtro de búsqueda local para usuarios
  filtroUsuario = '';
  get usuariosFiltrados(): UsuarioConPermisos[] {
    if (!this.filtroUsuario) return this.usuariosConPermisos;
    const filtro = this.filtroUsuario.toLowerCase();
    return this.usuariosConPermisos.filter(u =>
      u.userName.toLowerCase().includes(filtro) ||
      u.fullName.toLowerCase().includes(filtro)
    );
  }
}
