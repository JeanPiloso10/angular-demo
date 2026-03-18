import {
  Component, EventEmitter, Input, OnInit,
  HostListener, Output, ViewChild,
  ElementRef, inject
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { RolDTO } from '../../roles/roles'
import { RolesService } from '../../roles/roles.service'
import { ToastrService } from 'ngx-toastr';
import { FormValidationService } from '@core/services/form-validation.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { catchError, finalize, firstValueFrom, forkJoin, of } from 'rxjs';
import { Router, UrlSerializer, NavigationExtras } from '@angular/router';
import { AreasService } from '../../area/area.service';
import { SecurityService } from '@core/services/security.service';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { PermissionService } from '@core/services/permission.service';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import Swal from 'sweetalert2';
import { SpinnerService } from '@core/services/spinner.service';
import { UsuariosService } from '../usuarios.service';
import { EmitType } from '@syncfusion/ej2-base';
import { Query } from '@syncfusion/ej2-data';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { AuditoriaConsultaComponent } from '@app/shared-features/components/auditoria-consulta/auditoria-consulta.component';
import { ModalHelperService } from '@app/core/services/modal-helper.service';
import { Operacion } from '@app/shared-features/enums/Operacion';

@Component({
  selector: 'app-formulario-usuario',
  templateUrl: './formulario-usuario.component.html',
  styleUrl: './formulario-usuario.component.scss',
  standalone:false
})
export class FormularioUsuarioComponent implements OnInit {


  entidad = 'usuario'; 

  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;
  @ViewChild('UserName') userName!: ElementRef;

  @Input() errores: string;
  @Input() modelo: any;
  @Input() StateEnum: TipoAccion;
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();

  public tipoAccion = TipoAccion;
  // public listadoRoles: RolDTO[] = [];
  public listadoRoles:any;
  public formRoles: string[] = [];
  public listadoAreas: any[] = [];
  public formAreas: string[] = [];
  public tituloFormulario: string;
  public customStylesValidated = false;
  public form: FormGroup;
  public default: string = 'Default';
  public fields: Object = { text: 'name', value: 'id' };
  public fieldsArea: Object = { text: 'cnoArea', value: 'codigo' };
  public multiselectWaterMarkRol: string = 'Roles de usuario';
  public multiselectWaterMarkArea: string = 'Áreas';
  public multiselectWaterMarkAreaPredeterminada: string = 'Área predeterminada';
  estadoBotones = {
    btnNuevo: false,
    btnModificar: false,
    btnGrabar: false,
    btnAnular: false,
    btnSalir: false,
    btnBuscar: false,
    btnConsultar:false,
    btnAuditoria:false
  };
  permissions: OperacionesDto[] = [];

  constructor(private urlSerializer: UrlSerializer,
  private  rolService:RolesService,
  private  securityService :SecurityService,
  private  areaService :AreasService,
  private  userService :UsuariosService,
  private  validationService :FormValidationService,
  private  toastr :ToastrService,
  private  router :Router,
  private  permissionService :PermissionService,
  private  spinnerService:SpinnerService,
  private modalHelperService: ModalHelperService
  ) {
    this.form = this.initForm();
  }

  async ngOnInit() {
    // Suscripción a los cambios de valor del checkbox
    this.form.get('Status')?.valueChanges.subscribe((value) => {
      this.updateLabel(value);
    });
  
    // Inicializar el componente
    this.initializeComponent();
  }

  private async initializeComponent() {
    try
    {
      await this.loadPrimaryInitialData();
      await this.patchFormValues();
      this.barraBotones();
    }catch(error)
    {
      this.toastr.error(cadenaErrores(error));
    }
  }

  async loadPrimaryInitialData() {

    const results = await firstValueFrom(forkJoin({
      rolesResponse: this.rolService.todos().pipe(catchError(error => of({ result: [] }))),
      areasResponse: this.areaService.listado().pipe(catchError(error => of({ result: [] }))),
      permission: this.permissionService.getPermissionByTransaction(TransactionCode.usuario).pipe(catchError(error => of({ result: [] })))

    }));

      this.listadoRoles = results.rolesResponse.result;
      this.listadoAreas = results.areasResponse.result;

    if (results.permission.isSuccess) {
      this.permissions = results.permission.result as OperacionesDto[];

      if (this.permissions.length === 0) {
        this.router.navigate(['/pages/403']);
    }
    
    } else {
      this.permissions = [];
    }
    this.form.get('Status').patchValue(true);
  }

  getInvalidControls() {
    Object.values(this.form.controls).forEach(control => {
      if (control.invalid) {
        control.markAsTouched();
      }
    });
  }

  barraBotones() {

    this.form.enable();


    if (this.StateEnum == TipoAccion.Read) {

      this.estadoBotones.btnNuevo = this.tienePermiso('N');
      this.estadoBotones.btnGrabar = false;
      this.estadoBotones.btnGrabar = false;
      this.estadoBotones.btnConsultar = true;
      this.estadoBotones.btnAuditoria = this.tienePermiso(Operacion.Auditoria);
      if(this.modelo && this.modelo.id)
      {

        this.estadoBotones.btnModificar = this.tienePermiso('M');
        this.form.get('UserName')?.disable();
        this.form.get('Email')?.disable();
        this.form.get('PhoneNumber')?.disable();
        this.form.get('FullName')?.disable();
        this.form.get('Status')?.disable();
        this.form.get('Roles')?.disable();
        this.form.get('Areas')?.disable();
        this.form.get('AreaPredeterminada')?.disable();
      }
      else{

        this.estadoBotones.btnModificar = false;
        this.form.get('Email')?.disable();
        this.form.get('PhoneNumber')?.disable();
        this.form.get('FullName')?.disable();
        this.form.get('Status')?.disable();
        this.form.get('Roles')?.disable();
        this.form.get('Areas')?.disable();
        this.form.get('AreaPredeterminada')?.disable();
      }


    }
   else if (this.StateEnum == TipoAccion.Update) {

    this.estadoBotones.btnGrabar = true;
    this.estadoBotones.btnConsultar = false;
    this.estadoBotones.btnAuditoria = false;
    this.form.get('UserName')?.disable();
      
    // this.form.enable();
   }
   else if (this.StateEnum == TipoAccion.Create) {
    this.estadoBotones.btnConsultar = false;
    this.estadoBotones.btnGrabar = true;
    this.estadoBotones.btnAuditoria = false;
   }
  }

  onEnterKeyPressed()
  {
    try {

      const userName = this.form.get("UserName")?.value;
  
      if (userName != undefined && userName != "") {

        this.userService.consultaUserNameYRoles(userName).pipe(
          finalize(() => this.spinnerService.hideGlobalSpinner())
        ).subscribe({
          next: (response) => {

          if (response.isSuccess) {
            this.modelo = [];
            const userId = response.result?.id;
            this.router.navigate(['/usuario/ver', userId]);

          } else {
            this.toastr.error(response.message);

          }
        },
        error: (error) => {
          this.toastr.error(cadenaErrores(error))
        }
      });

    
      } 
    }
    catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  tienePermiso(codigo: string): boolean {
    let result: boolean = false;
    if (this.permissions && this.permissions.length > 0) {
      result = this.permissions.some((e:any) => e.codigo.toLowerCase() === codigo.toLowerCase());
    }
    return result;
  }

  async patchFormValues() {

    if ((this.StateEnum == TipoAccion.Update || this.StateEnum == TipoAccion.Read) && this.modelo) {

      this.form.patchValue(
        {
          id:this.modelo.id,
          UserName: this.modelo.userName,
          Email: this.modelo.email,
          PhoneNumber: this.modelo.phoneNumber,
          FullName: this.modelo.fullName,
          Status: this.modelo.status,
          Roles: this.modelo.roles,
          Areas: this.modelo.areas,
          AreaPredeterminada: this.modelo.areaPredeterminada
        }
      );
    }
   

  }

  public onFilteringArea: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    let query = new Query();
    query = (e.text != "") ? query.where("cnoArea", "contains", e.text, true) : query;
    e.updateData(this.listadoAreas, query);
  };


  ngAfterViewInit(): void {
    this.userName.nativeElement.focus();
  }

  private initForm(): FormGroup {
    return new FormGroup({
      id: new FormControl(''),
      UserName: new FormControl('', Validators.required),
      Email: new FormControl('', Validators.email),
      FullName: new FormControl('', Validators.required),
      PhoneNumber: new FormControl(''),
      Status: new FormControl(true),
      Roles: new FormControl(this.formRoles),
      Areas: new FormControl(this.formAreas),
      AreaPredeterminada: new FormControl(null),
      frontendUrl: new FormControl(window.location.origin, Validators.required),  // Añade este campo
      usuarioCreacion: new FormControl(''),
      fechaCreacion: new FormControl(''),
      equipoCreacion: new FormControl(''),
      usuarioModificacion: new FormControl(''),
      fechaModificacion: new FormControl(''),
      equipoModificacion: new FormControl(''),
    });
  }

  updateLabel(value: boolean) {
    if (this.lblEstado && this.lblEstado.nativeElement) {
      this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
    }
  }

  nuevoRegistro(): void {
    this.router.navigate(['/' + this.entidad + '/nuevo']);
  }

  guardarCambios(): void {
    if (!this.form.valid) {
      this.toastr.error('Por favor, complete el formulario correctamente.');
      this.getInvalidControls();
      return;
    }
    const formValues = this.form.getRawValue();
    const updateData = {
      usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : undefined,
      fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5(): undefined,
      usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
      fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5() : undefined,
    };
    Object.assign(formValues, updateData);
    this.onSubmit.emit(formValues);
  }

  


  async cancelar() {
    // this.router.navigate(['/usuario']);
    if (this.StateEnum == TipoAccion.Create || this.StateEnum == TipoAccion.Update) {
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
        try {
          this.cancelarFormulario();

        } catch (errores) {
          this.toastr.error(cadenaErrores(errores));
        } finally {
          this.spinnerService.hideGlobalSpinner();
        }
      }

    }
    else {
      this.cancelarFormulario();
    }
  }

  modificarRegistro(): void {
    const id = this.form.get('id')?.value;
    if (id) {
      // this.allowCustomValue = true;
      this.router.navigate(['/' + this.entidad + '/modificar', id]);
    }
  }

  cancelarFormulario() {
    try {

      this.spinnerService.showGlobalSpinner();
      if (this.StateEnum == TipoAccion.Update) {

        const userId = this.modelo.id;
        this.router.navigate(['/usuario/ver', userId]);
      }
      else {

        this.router.navigate(['/usuario/ver']);
       
      }

    }
    catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
    finally {
      this.spinnerService.hideGlobalSpinner();
    }

  }
  
  public filterRole: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    const query = e.text ? new Query().where('name', 'contains', e.text, true) : new Query();
    e.updateData(this.listadoRoles, query);
  };

async VerPermisosPorUsuario() { 
  const userName = this.form.get('UserName')?.value;
  const extras: NavigationExtras | undefined = userName
    ? { queryParams: { tipoVista: TransactionCode.usuario, listaEntidad: userName } }
    : { queryParams: { tipoVista: TransactionCode.usuario } };
  await this.navegarConConfirmacion('/permisousuario/formulario', extras);
}

async VerPermisosPorRol() { 
  await this.navegarConConfirmacion('/permisorol/formulario');
}

async VerRoles() { 
  await this.navegarConConfirmacion('/rol/listado');
}

private openInNewTab(ruta: string, extras?: NavigationExtras): void {
  const urlTree = this.router.createUrlTree([ruta], extras);
  const url     = this.urlSerializer.serialize(urlTree);
  window.open(`${window.location.origin}/#${url}`, '_blank');
}

//flujo común
private async navegarConConfirmacion(ruta: string, extras?: NavigationExtras): Promise<void> {
  try {
    // sin cambios pendientes ⇒ navega directo
    if (this.StateEnum === TipoAccion.Read) {
      await this.router.navigate([ruta], extras);
      return;
    }

    // hay cambios ⇒ muestra alerta
    const { isConfirmed, isDenied } = await Swal.fire({
      title: 'Formulario en proceso',
      html: `Se encuentra en modo <b>${
        this.StateEnum === TipoAccion.Update ? 'edición' : 'creación'
      }</b> del formulario.<br><br>Si continúa, perderá los cambios actuales.`,
      icon: 'warning',
      showCloseButton: true,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Descartar cambios',
      denyButtonText: 'Ver en nueva pestaña',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      denyButtonColor: '#3085d6',
      cancelButtonColor: '#aaa'
    });

    if (isConfirmed) {
      await this.router.navigate([ruta], extras);
    } else if (isDenied) {
      this.openInNewTab(ruta, extras);
    }
  } catch (error) {
    this.handleError(error);
  }
}

   private handleError(error: any) {
      this.toastr.error(cadenaErrores(error));
      this.spinnerService.hideGlobalSpinner();
  }

  obtenerError(campoNombre: string): string {
    const campo = this.form.get(campoNombre);
    if (campo && (campo.dirty || campo.touched) && campo.invalid) {
      return this.validationService.obtenerMensajeError(campo);
    }
    return '';
  }

  async getAuditoria() {
    try {
      const userName = this.form.get('UserName')?.value?.trim();

      if (!userName || userName === '') {  // Verifica que ambos campos no sean vacíos o undefined
        this.toastr.warning("Para visualizar los datos de auditoría, usted debe primero consultar un item.");
        return;
      }

      const modalRef = this.modalHelperService.abrirModal(AuditoriaConsultaComponent, {
        codigoTransaccion: TransactionCode.usuario,
        identificacionPrincipal: userName
        }, {
          size: 'xl'
        });


    } catch (error) {
      this.handleError(error);
    }
  }
  
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Combinación para 'Alt+G' - Grabar
    if (event.altKey && event.key === 'g') {
      this.guardarCambios();
      event.preventDefault();
    }
    // Combinación para 'Alt+C' - Cancelar
    else if (event.altKey && event.key === 'c') {
      this.cancelar();
      event.preventDefault();
    }
  }



}
