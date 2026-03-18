import {
  Component, OnInit, ViewChild, ElementRef, HostListener,
  Input, Output, EventEmitter
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, UrlSerializer, NavigationExtras } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, debounceTime, distinctUntilChanged, finalize, firstValueFrom, forkJoin, of, Subject, switchMap } from 'rxjs';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { ComboBoxComponent, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import Swal from 'sweetalert2';

import { TipoAccion } from '@shared/enums/TipoAccion';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { Operacion } from '@shared/enums/Operacion';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';

import { SecurityService } from '@core/services/security.service';
import { SpinnerService } from '@core/services/spinner.service';
import { PermissionService } from '@core/services/permission.service';
import { FormValidationService } from '@core/services/form-validation.service';
import { ModalHelperService } from '@core/services/modal-helper.service';
import { GestionAccesosService } from '../gestion-accesos.service';
import { CrearRolDialogComponent } from '../crear-rol-dialog/crear-rol-dialog.component';
import { CopiarPermisosDialogComponent } from '../copiar-permisos-dialog/copiar-permisos-dialog.component';
import { SetPasswordComponent } from '../../usuarios/set-password/set-password.component';

@Component({
  selector: 'app-formulario-gestion',
  templateUrl: './formulario-gestion.component.html',
  styleUrl: './formulario-gestion.component.scss',
  standalone: false
})
export class FormularioGestionComponent implements OnInit {

  entidad = 'gestionaccesos';

  @ViewChild('UserName') userName!: ElementRef;
  @ViewChild('UserNameCombo') userNameCombo!: ComboBoxComponent;
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;

  @Input() errores: string;
  @Input() modelo: any;
  @Input() StateEnum: TipoAccion;
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();

  public tipoAccion = TipoAccion;

  // Form principal de usuario
  form: FormGroup;

  // Indicador de si el usuario ya fue guardado (tiene ID)
  get usuarioGuardado(): boolean {
    return !!(this.modelo && this.modelo.id);
  }

  // Catálogos
  listadoRoles: any[] = [];
  listadoAreas: any[] = [];
  listadoSucursales: any[] = [];
  listadoBodegas: any[] = [];
  listadoBodegasFiltered: any[] = [];

  // Fields para dropdowns
  fieldsRol: Object = { text: 'name', value: 'id' };
  fieldsArea: Object = { text: 'cnoArea', value: 'codigo' };
  fieldsSucursal: Object = { text: 'cnoSucursal', value: 'idSucursal' };
  fieldsBodega: Object = { text: 'cnoBodega', value: 'idBodega' };

  // Permisos de la transacción
  permissions: OperacionesDto[] = [];

  // Botones
  estadoBotones = {
    btnNuevo: false,
    btnModificar: false,
    btnGrabar: false,
    btnGrabarPermisos: false,
    btnConsultar: false,
    btnAuditoria: false,
    btnSetPassword: false,
    btnDesactivar2FA: false,
    btnCopiarPermisos: false,
  };

  // Snapshot de permisos originales para detectar cambios
  private permisosOriginales: { sucursales: number[], bodegas: number[] } = { sucursales: [], bodegas: [] };

  // Filtro de usuarios
  searchUserTextChanged = new Subject<string>();
  cbUsuarios: any[] = [];
  fieldsUsuario: Object = { text: 'userName', value: 'userName' };
  isLoadingSearchUser = false;

  // Placeholder texts
  multiselectWaterMarkRol = 'Roles de usuario';
  multiselectWaterMarkArea = 'Áreas';
  default: string = 'Default';

  constructor(
    private router: Router,
    private urlSerializer: UrlSerializer,
    private toastr: ToastrService,
    private securityService: SecurityService,
    private spinnerService: SpinnerService,
    private permissionService: PermissionService,
    private validationService: FormValidationService,
    private modalHelperService: ModalHelperService,
    private gestionService: GestionAccesosService
  ) {
    this.form = this.initForm();
  }

  async ngOnInit() {
    this.form.get('Status')?.valueChanges.subscribe(v => this.updateLabel(v));
    await this.initializeComponent();
  }

  ngAfterViewInit(): void {
    if (this.userName) {
      this.userName.nativeElement.focus();
    }
  }

  // ═══════════════════════════════════════════════
  //  INICIALIZACIÓN
  // ═══════════════════════════════════════════════

  private async initializeComponent() {
    try {
      await this.loadInitialData();
      await this.patchFormValues();
      this.barraBotones();
      this.debounceUsuario();
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  private async loadInitialData() {
    const results = await firstValueFrom(forkJoin({
      roles: this.gestionService.obtenerRoles().pipe(catchError(() => of({ result: [] }))),
      areas: this.gestionService.obtenerAreas().pipe(catchError(() => of({ result: [] }))),
      sucursales: this.gestionService.obtenerSucursales().pipe(catchError(() => of({ result: [] }))),
      bodegas: this.gestionService.obtenerBodegas().pipe(catchError(() => of({ result: [] }))),
      permission: this.permissionService.getPermissionByTransaction(TransactionCode.usuario)
                    .pipe(catchError(() => of({ result: [] })))
    }));

    this.listadoRoles = results.roles.result || [];
    this.listadoAreas = results.areas.result || [];
    this.listadoSucursales = results.sucursales.result || [];
    this.listadoBodegas = results.bodegas.result || [];

    if (results.permission.isSuccess) {
      this.permissions = results.permission.result as OperacionesDto[];
      if (this.permissions.length === 0) {
        this.router.navigate(['/pages/403']);
      }
    } else {
      this.permissions = [];
    }

    this.form.get('Status')?.patchValue(true);
  }

  async patchFormValues() {
    if ((this.StateEnum === TipoAccion.Update || this.StateEnum === TipoAccion.Read) && this.modelo) {
      this.form.patchValue({
        id: this.modelo.id,
        UserName: this.modelo.userName,
        Email: this.modelo.email,
        PhoneNumber: this.modelo.phoneNumber,
        FullName: this.modelo.fullName,
        Status: this.modelo.status,
        TwoFactorEnabled: this.modelo.twoFactorEnabled ?? false,
        Roles: this.modelo.roles,
        Areas: this.modelo.areas,
        AreaPredeterminada: this.modelo.areaPredeterminada
      });

      // Cargar permisos del usuario
      if (this.modelo.userName) {
        await this.cargarPermisosUsuario(this.modelo.userName);
      }
    }
  }

  // ═══════════════════════════════════════════════
  //  PERMISOS DE USUARIO (SUCURSALES / BODEGAS)
  // ═══════════════════════════════════════════════

  private async cargarPermisosUsuario(userName: string) {
    try {
      const response: any = await firstValueFrom(
        this.gestionService.obtenerPermisosUsuario(userName)
      );
      const sucursales: number[] = [];
      const bodegas: number[] = [];

      (response || []).forEach((permiso: any) => {
        if (permiso.codigoTransaccion === TransactionCode.sucursal) {
          sucursales.push(Number(permiso.referencia1));
        } else if (permiso.codigoTransaccion === TransactionCode.bodega) {
          bodegas.push(Number(permiso.referencia1));
        }
      });

      this.form.patchValue({ sucursales, bodegas });
      this.filtrarBodegasPorSucursal(sucursales);

      // Guardar snapshot de permisos originales DESPUÉS del filtro de bodegas
      this.permisosOriginales = {
        sucursales: [...(this.form.get('sucursales')?.value || [])].map(Number),
        bodegas: [...(this.form.get('bodegas')?.value || [])].map(Number)
      };
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  filtrarBodegasPorSucursal(selectedSucursalesIds: number[]): void {
    if (!selectedSucursalesIds || selectedSucursalesIds.length === 0) {
      this.listadoBodegasFiltered = [];
      this.form.patchValue({ bodegas: [] });
      return;
    }

    const selectedSucursales = this.listadoSucursales.filter((s: any) =>
      selectedSucursalesIds.includes(s.idSucursal as number)
    );

    this.listadoBodegasFiltered = this.listadoBodegas.filter((bodega: any) =>
      selectedSucursales.some((suc: any) =>
        suc.codigoEmpresa === bodega.codigoEmpresa &&
        suc.codigoDivision === bodega.codigoDivision &&
        suc.codigoSucursal === bodega.codigoSucursal
      )
    );

    const bodegasActuales = this.form.get('bodegas')?.value || [];
    const bodegasValidas = bodegasActuales.filter((id: any) =>
      this.listadoBodegasFiltered.some(b => b.idBodega === id)
    );
    this.form.patchValue({ bodegas: bodegasValidas });
  }

  onSucursalChange(event: any): void {
    this.filtrarBodegasPorSucursal(event || []);
  }

  // ═══════════════════════════════════════════════
  //  GUARDAR PERMISOS (SUCURSALES / BODEGAS)
  // ═══════════════════════════════════════════════

  async guardarPermisos() {
    if (!this.modelo || !this.modelo.userName) {
      this.toastr.error('Debe guardar el usuario primero.');
      return;
    }

    const userName = this.modelo.userName;
    const sucursales = this.form.get('sucursales')?.value || [];
    const bodegas = this.form.get('bodegas')?.value || [];
    const fCreacion = obtenerFechaEnHusoHorarioMinus5();
    const permisos: any[] = [];

    if (sucursales.length === 0) {
      permisos.push({
        userName,
        codigoTransaccion: TransactionCode.sucursal,
        referencia1: '',
        usuarioCreacion: this.securityService.getUserName(),
        fechaCreacion: fCreacion,
        accion: TipoAccion.Delete
      });
    } else {
      sucursales.forEach((id: string) => {
        permisos.push({
          userName,
          codigoTransaccion: TransactionCode.sucursal,
          referencia1: id.toString(),
          usuarioCreacion: this.securityService.getUserName(),
          fechaCreacion: fCreacion,
          accion: TipoAccion.Create
        });
      });
    }

    if (bodegas.length === 0) {
      permisos.push({
        userName,
        codigoTransaccion: TransactionCode.bodega,
        referencia1: '',
        usuarioCreacion: this.securityService.getUserName(),
        fechaCreacion: fCreacion,
        accion: TipoAccion.Delete
      });
    } else {
      bodegas.forEach((id: string) => {
        permisos.push({
          userName,
          codigoTransaccion: TransactionCode.bodega,
          referencia1: id.toString(),
          usuarioCreacion: this.securityService.getUserName(),
          fechaCreacion: fCreacion,
          accion: TipoAccion.Create
        });
      });
    }

    this.spinnerService.showGlobalSpinner();
    try {
      //await firstValueFrom(this.gestionService.guardarPermisosUsuario(permisos));
      this.toastr.success('Permisos guardados exitosamente.');

      // Actualizar snapshot de permisos originales
      this.permisosOriginales = {
        sucursales: [...sucursales],
        bodegas: [...bodegas]
      };
    } catch (error) {
      this.toastr.error('Error al guardar permisos: ' + cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  // ═══════════════════════════════════════════════
  //  CREAR ROL INLINE
  // ═══════════════════════════════════════════════

  abrirCrearRol(): void {
    const modalRef = this.modalHelperService.abrirModal(CrearRolDialogComponent, {}, {});

    modalRef.closed.subscribe((nuevoRol: any) => {
      if (nuevoRol) {
        this.listadoRoles = [...this.listadoRoles, nuevoRol];
        const rolesActuales = this.form.get('Roles')?.value || [];
        this.form.get('Roles')?.patchValue([...rolesActuales, nuevoRol.id]);
        this.toastr.success(`Rol "${nuevoRol.name}" creado y asignado.`);
      }
    });
  }

  // ═══════════════════════════════════════════════
  //  BOTONES Y ESTADO
  // ═══════════════════════════════════════════════

  barraBotones() {
    this.form.enable();
    const tieneM = this.tienePermiso(Operacion.Modificar);
    const tieneN = this.tienePermiso(Operacion.Crear);

    if (this.StateEnum === TipoAccion.Read) {
      this.estadoBotones.btnNuevo = tieneN;
      this.estadoBotones.btnGrabar = false;
      this.estadoBotones.btnConsultar = true;
      this.estadoBotones.btnGrabarPermisos = tieneM && this.usuarioGuardado;
      this.estadoBotones.btnSetPassword = this.tienePermiso(Operacion.SetPassword) && this.usuarioGuardado;
      this.estadoBotones.btnDesactivar2FA = tieneM && this.usuarioGuardado && this.modelo?.twoFactorEnabled === true;
      this.estadoBotones.btnCopiarPermisos = tieneM && this.usuarioGuardado;

      if (this.modelo && this.modelo.id) {
        this.estadoBotones.btnModificar = tieneM;
        this.form.get('UserName')?.disable();
        this.form.get('Email')?.disable();
        this.form.get('PhoneNumber')?.disable();
        this.form.get('FullName')?.disable();
        this.form.get('Status')?.disable();
        this.form.get('TwoFactorEnabled')?.disable();
        this.form.get('Roles')?.disable();
        this.form.get('Areas')?.disable();
        this.form.get('AreaPredeterminada')?.disable();
        // Permisos: quedan habilitados para editar
        this.form.get('sucursales')?.enable();
        this.form.get('bodegas')?.enable();
      } else {
        this.estadoBotones.btnModificar = false;
        this.form.get('Email')?.disable();
        this.form.get('PhoneNumber')?.disable();
        this.form.get('FullName')?.disable();
        this.form.get('Status')?.disable();
        this.form.get('TwoFactorEnabled')?.disable();
        this.form.get('Roles')?.disable();
        this.form.get('Areas')?.disable();
        this.form.get('AreaPredeterminada')?.disable();
        this.form.get('sucursales')?.disable();
        this.form.get('bodegas')?.disable();
      }
    } else if (this.StateEnum === TipoAccion.Update) {
      this.estadoBotones.btnNuevo = false;
      this.estadoBotones.btnModificar = false;
      this.estadoBotones.btnGrabar = true;
      this.estadoBotones.btnConsultar = false;
      this.estadoBotones.btnGrabarPermisos = true;
      this.estadoBotones.btnSetPassword = false;
      this.form.get('UserName')?.disable();
      this.form.get('TwoFactorEnabled')?.disable();
    } else if (this.StateEnum === TipoAccion.Create) {
      this.estadoBotones.btnNuevo = false;
      this.estadoBotones.btnModificar = false;
      this.estadoBotones.btnGrabar = true;
      this.estadoBotones.btnConsultar = false;
      this.estadoBotones.btnGrabarPermisos = false;
      this.estadoBotones.btnSetPassword = false;
      this.form.get('sucursales')?.disable();
      this.form.get('bodegas')?.disable();
      this.form.get('TwoFactorEnabled')?.disable();
    }
  }

  tienePermiso(codigo: string): boolean {
    return this.permissions?.some(
      (p: any) => p.codigo?.toLowerCase() === codigo.toLowerCase()
    ) ?? false;
  }

  async nuevoRegistro(): Promise<void> {
    if (await this.confirmarSiHayCambiosPermisos()) {
      this.router.navigate(['/' + this.entidad + '/nuevo']);
    }
  }

  async modificarRegistro(): Promise<void> {
    const id = this.form.get('id')?.value;
    if (id && await this.confirmarSiHayCambiosPermisos()) {
      this.router.navigate(['/' + this.entidad + '/modificar', id]);
    }
  }

  async guardarCambios(): Promise<void> {
    if (!this.form.valid) {
      const camposInvalidos = this.obtenerCamposInvalidos();
      if (camposInvalidos.length > 0) {
        this.toastr.error('Campos obligatorios: ' + camposInvalidos.join(', '));
      } else {
        this.toastr.error('Por favor, complete el formulario correctamente.');
      }
      this.marcarCamposInvalidos();
      return;
    }

    // Si hay cambios en permisos y el usuario ya existe, guardarlos primero
    if (this.usuarioGuardado && this.hayPermisosSinGuardar()) {
      try {
        await this.guardarPermisos();
      } catch (error) {
        this.toastr.error('Error al guardar permisos: ' + cadenaErrores(error));
        return;
      }
    }

    const formValues = this.form.getRawValue();
    const userData: any = {
      UserName: formValues.UserName,
      Email: formValues.Email,
      FullName: formValues.FullName,
      PhoneNumber: formValues.PhoneNumber,
      Status: formValues.Status,
      Roles: formValues.Roles,
      Areas: formValues.Areas,
      AreaPredeterminada: formValues.AreaPredeterminada,
      frontendUrl: formValues.frontendUrl,
      usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : undefined,
      fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5() : undefined,
      usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
      fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5() : undefined,
    };
    this.onSubmit.emit(userData);
  }

  async cancelar() {
    if (this.StateEnum === TipoAccion.Create || this.StateEnum === TipoAccion.Update) {
      const result = await Swal.fire({
        title: 'Confirmación',
        text: '¿Desea cancelar la operación?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cancelar!',
        cancelButtonText: 'Cancelar'
      });
      if (result.isConfirmed) {
        this.cancelarFormulario();
      }
    } else if (await this.confirmarSiHayCambiosPermisos()) {
      this.cancelarFormulario();
    }
  }

  cancelarFormulario() {
    try {
      this.spinnerService.showGlobalSpinner();
      if (this.StateEnum === TipoAccion.Update) {
        const userId = this.modelo?.id;
        this.router.navigate(['/' + this.entidad + '/ver', userId]);
      } else {
        this.router.navigate(['/' + this.entidad + '/ver']);
      }
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  onEnterKeyPressed() {
    try {
      const userNameValue = this.form.get('UserName')?.value;
      if (!userNameValue) return;

      this.spinnerService.showGlobalSpinner();
      this.gestionService.buscarUsuarioPorUsername(userNameValue).pipe(
        finalize(() => this.spinnerService.hideGlobalSpinner())
      ).subscribe({
        next: (response: any) => {
          if (response.isSuccess && response.result?.id) {
            this.router.navigate(['/' + this.entidad + '/ver', response.result.id]);
          } else {
            this.toastr.error(response.message || 'Usuario no encontrado.');
          }
        },
        error: (error) => this.toastr.error(cadenaErrores(error))
      });
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  async irAsignacionMasiva(): Promise<void> {
    if (await this.confirmarSiHayCambiosPermisos()) {
      this.router.navigate(['/' + this.entidad + '/asignacion-masiva']);
    }
  }

  async irListadoUsuarios(): Promise<void> {
    if (await this.confirmarSiHayCambiosPermisos()) {
      this.router.navigate(['/usuario/listado']);
    }
  }

  // ═══════════════════════════════════════════════
  //  FILTRO DE USUARIOS (COMBOBOX)
  // ═══════════════════════════════════════════════

  debounceUsuario() {
    if (this.StateEnum === TipoAccion.Read) {
      this.searchUserTextChanged.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(query => {
          this.isLoadingSearchUser = true;
          return this.gestionService.filtrarUsuarios(query).pipe(
            catchError(error => {
              this.toastr.error(cadenaErrores(error));
              return of(null);
            }),
            finalize(() => this.isLoadingSearchUser = false)
          );
        })
      ).subscribe({
        next: (response) => {
          if (response) {
            if (response.isSuccess !== false) {
              this.cbUsuarios = response.result || response;
            } else {
              this.toastr.error(response.message || 'Error al cargar usuarios.');
            }
          }
        },
        error: (err) => {
          this.toastr.error(cadenaErrores(err));
        }
      });
    }
  }

  debouncedGetUsuario(event: FilteringEventArgs) {
    if (this.StateEnum === TipoAccion.Read) {
      const query: string = event.text;
      if (query.length >= 3 && !this.isLoadingSearchUser) {
        this.searchUserTextChanged.next(query);
      }
    }
  }

  onUsuarioChange(event: any) {
    try {
      if (this.StateEnum === TipoAccion.Read && event.isInteracted) {
        const selectedValue = event.itemData;
        if (selectedValue && selectedValue.id) {
          this.router.navigate(['/' + this.entidad + '/ver', selectedValue.id]);
        }
      }
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  // ═══════════════════════════════════════════════
  //  FILTROS
  // ═══════════════════════════════════════════════

  public filterRole: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    const query = e.text ? new Query().where('name', 'contains', e.text, true) : new Query();
    e.updateData(this.listadoRoles, query);
  };

  public onFilteringArea: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    const query = e.text ? new Query().where('cnoArea', 'contains', e.text, true) : new Query();
    e.updateData(this.listadoAreas, query);
  };

  public onSucursalFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    const query = e.text ? new Query().where('cnoSucursal', 'contains', e.text, true) : new Query();
    e.updateData(this.listadoSucursales, query);
  };

  public onBodegaFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    const query = e.text ? new Query().where('cnoBodega', 'contains', e.text, true) : new Query();
    e.updateData(this.listadoBodegasFiltered, query);
  };

  // ═══════════════════════════════════════════════
  //  DETECCIÓN DE CAMBIOS EN PERMISOS
  // ═══════════════════════════════════════════════

  private hayPermisosSinGuardar(): boolean {
    const sucursalesActuales = (this.form.get('sucursales')?.value || []).map(Number).sort();
    const bodegasActuales = (this.form.get('bodegas')?.value || []).map(Number).sort();
    const sucursalesOrig = [...this.permisosOriginales.sucursales].sort();
    const bodegasOrig = [...this.permisosOriginales.bodegas].sort();

    const arraysIguales = (a: number[], b: number[]) =>
      a.length === b.length && a.every((v, i) => v === b[i]);

    return !arraysIguales(sucursalesActuales, sucursalesOrig) ||
           !arraysIguales(bodegasActuales, bodegasOrig);
  }

  private async confirmarSiHayCambiosPermisos(): Promise<boolean> {
    if (!this.hayPermisosSinGuardar()) {
      return true;
    }

    const result = await Swal.fire({
      title: 'Cambios sin guardar',
      text: 'Tiene cambios en los permisos de sucursales/bodegas que no han sido guardados. ¿Desea continuar sin guardar?',
      icon: 'warning',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: '#3085d6',
      denyButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Continuar sin guardar',
      denyButtonText: 'Guardar permisos',
      cancelButtonText: 'Cancelar'
    });

    if (result.isDenied) {
      await this.guardarPermisos();
      return true;
    }

    return result.isConfirmed;
  }

  // ═══════════════════════════════════════════════
  //  UTILIDADES
  // ═══════════════════════════════════════════════

  updateLabel(value: boolean) {
    if (this.lblEstado?.nativeElement) {
      this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
    }
  }

  obtenerError(campoNombre: string): string {
    const campo = this.form.get(campoNombre);
    if (campo && (campo.dirty || campo.touched) && campo.invalid) {
      return this.validationService.obtenerMensajeError(campo);
    }
    return '';
  }

  private marcarCamposInvalidos() {
    Object.values(this.form.controls).forEach(c => {
      if (c.invalid) {
        c.markAsTouched();
        c.markAsDirty();
      }
    });
  }

  private obtenerCamposInvalidos(): string[] {
    const nombres: { [key: string]: string } = {
      UserName: 'Username',
      Email: 'Email',
      FullName: 'Nombre Completo',
      frontendUrl: 'URL'
    };
    const invalidos: string[] = [];
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.invalid && control.enabled) {
        invalidos.push(nombres[key] || key);
      }
    });
    return invalidos;
  }

  // ═══════════════════════════════════════════════
  //  SET PASSWORD
  // ═══════════════════════════════════════════════

  abrirSetPassword(): void {
    if (!this.modelo || !this.modelo.id) {
      this.toastr.warning('Debe seleccionar un usuario primero.');
      return;
    }
    this.modalHelperService.abrirModal(SetPasswordComponent, {
      id: this.modelo.id,
      username: this.modelo.userName
    }, {});
  }

  // ═══════════════════════════════════════════════
  //  DESACTIVAR 2FA
  // ═══════════════════════════════════════════════

  async desactivar2FA(): Promise<void> {
    if (!this.modelo || !this.modelo.id) return;

    const result = await Swal.fire({
      title: 'Confirmación',
      text: '¿Desea quitar la autenticación de doble factor para el usuario seleccionado?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      this.spinnerService.showGlobalSpinner();
      try {
        const respuesta: any = await firstValueFrom(
          this.gestionService.desactivar2FA(this.modelo.id)
        );
        if (respuesta.isSuccess) {
          this.modelo.twoFactorEnabled = false;
          this.form.get('TwoFactorEnabled')?.patchValue(false);
          this.estadoBotones.btnDesactivar2FA = false;
          this.toastr.success('Autenticación de doble factor desactivada exitosamente.');
        } else {
          this.toastr.error(cadenaErrores(respuesta.message));
        }
      } catch (error) {
        this.toastr.error(cadenaErrores(error));
      } finally {
        this.spinnerService.hideGlobalSpinner();
      }
    }
  }

  // ═══════════════════════════════════════════════
  //  COPIAR PERMISOS
  // ═══════════════════════════════════════════════

  abrirCopiarPermisos(): void {
    if (!this.modelo || !this.modelo.userName) {
      this.toastr.warning('Debe seleccionar un usuario primero.');
      return;
    }

    const modalRef = this.modalHelperService.abrirModal(CopiarPermisosDialogComponent, {
      userNameDestino: this.modelo.userName
    }, {});

    modalRef.closed.subscribe(async (result: any) => {
      if (result) {
        // Confirmar antes de reemplazar
        const confirm = await Swal.fire({
          title: 'Confirmar Copia de Permisos',
          html: `Se copiarán los permisos del usuario <strong>${result.userNameOrigen}</strong> al usuario <strong>${result.userNameDestino}</strong>.<br><br>` +
                `<strong>${result.sucursales}</strong> sucursal(es), <strong>${result.bodegas}</strong> bodega(s) y <strong>${result.areas}</strong> área(s).<br><br>` +
                `<span class="text-danger">Esta acción reemplazará todos los permisos actuales.</span>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, copiar permisos',
          cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
          this.ejecutarCopiarPermisos(result.userNameOrigen, result.userNameDestino);
        }
      }
    });
  }

  private async ejecutarCopiarPermisos(userNameOrigen: string, userNameDestino: string): Promise<void> {
    this.spinnerService.showGlobalSpinner();
    try {
      const respuesta: any = await firstValueFrom(
        this.gestionService.copiarPermisos({ userNameOrigen, userNameDestino })
      );
      if (respuesta.isSuccess) {
        this.toastr.success(respuesta.message || 'Permisos copiados exitosamente.');
        // Recargar permisos del usuario destino
        await this.cargarPermisosUsuario(userNameDestino);
      } else {
        this.toastr.error(cadenaErrores(respuesta.message));
      }
    } catch (error) {
      this.toastr.error('Error al copiar permisos: ' + cadenaErrores(error));
    } finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }

  // ═══════════════════════════════════════════════
  //  FORMULARIO
  // ═══════════════════════════════════════════════

  private initForm(): FormGroup {
    return new FormGroup({
      id: new FormControl(''),
      UserName: new FormControl('', Validators.required),
      Email: new FormControl('', Validators.email),
      FullName: new FormControl('', Validators.required),
      PhoneNumber: new FormControl(''),
      Status: new FormControl(true),
      TwoFactorEnabled: new FormControl(false),
      Roles: new FormControl([]),
      Areas: new FormControl([]),
      AreaPredeterminada: new FormControl(null),
      frontendUrl: new FormControl(window.location.origin, Validators.required),
      // Permisos
      sucursales: new FormControl([]),
      bodegas: new FormControl([]),
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.altKey && event.key === 'g') {
      this.guardarCambios();
      event.preventDefault();
    } else if (event.altKey && event.key === 'c') {
      this.cancelar();
      event.preventDefault();
    }
  }
}
