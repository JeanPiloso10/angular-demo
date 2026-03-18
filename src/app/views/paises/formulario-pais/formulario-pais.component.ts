import { Component, HostListener, EventEmitter, Input, 
  OnInit, Output, ViewChild, ElementRef, AfterViewInit, 
  inject, 
  SimpleChanges} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup , Validators, ReactiveFormsModule } from '@angular/forms';
import { FormValidationService } from '@core/services/form-validation.service'
import { TipoAccion } from '@shared/enums/TipoAccion'
import { Router } from '@angular/router';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, firstValueFrom, forkJoin, of, throwError } from 'rxjs';
import { RegionesService } from '../../regiones/regiones.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { SecurityService } from '@core/services/security.service'
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha'
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { PermissionService } from '@core/services/permission.service';
import Swal from 'sweetalert2';
import { Operacion } from '@app/shared-features/enums/Operacion';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { ComboBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonModule, CardModule, FormModule, GridModule as GridCoreUI } from '@coreui/angular';


@Component({
  selector: 'app-formulario-pais',
  templateUrl: './formulario-pais.component.html',
  styleUrl: './formulario-pais.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToolbarModule,
    ComboBoxModule,
    CardModule,
    FormModule,
    GridCoreUI
  ]
})
export class FormularioPaisComponent  implements OnInit, AfterViewInit  {

  @Input() errores: string;
  @Input() modelo: any;  
  @Input() StateEnum: TipoAccion;
  @Input() isModal = false;
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;

  estadoBotones = {
    btnNuevo: false,
    btnModificar: false,
    btnGrabar: false, 
    btnSalir: false
  };


  localWaterMark = 'Seleccione una región.';
  regiones: any[];
  fields: Object = { text: 'descripcion', value: 'codigo' };

  @ViewChild('codigo') codigo!: ElementRef;
  @ViewChild('descripcion') descripcion!: ElementRef;

  form: FormGroup;
  tituloFormulario: string;
  tipoAccion = TipoAccion;
  entidad = 'pais';
  permissions:any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private validationService: FormValidationService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private regionesService: RegionesService,
    private securityService: SecurityService,
    private permissionService: PermissionService
  ) {
    this.form = this.initForm();
  }


  async ngOnInit() {
   await this.initializeComponent();
  }

  private async initializeComponent() {
    try {


      this.form.get('activo')?.valueChanges.subscribe((value) => {
        this.updateLabel(value);
      });

      if (!this.isModal) {
        await this.getPermissions();
        if (!this.permissions || this.permissions.length === 0) {
          return; // Detener el flujo si no hay permisos
        }
      }

      this.form.get('activo').patchValue(true);
      
      if (this.isModal) {
        this.estadoBotones.btnGrabar = true;
      } else {
        this.barraBotones();
      }
      await this.loadInitialData();
    }catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  updateLabel(value: boolean) {
    if (this.lblEstado && this.lblEstado.nativeElement) {
      this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
    }
  }

  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.
        getPermissionByTransaction(TransactionCode.pais).
        pipe(catchError(error => of({ result: [] })))
  
      }));

      
  
        this.permissions = results.permission.result as OperacionesDto[];

        if (this.permissions.length === 0) {
          this.router.navigate(['/pages/403']);
      };
      

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }


  private async loadInitialData() {
    // this.spinnerService.showGlobalSpinner();
    try {
      const response: any = await firstValueFrom(this.regionesService.todos());
      // this.spinnerService.hideGlobalSpinner();
      this.patchFormValues();
      if (response.isSuccess) {
        this.regiones = response.result;
        
      } else {
        this.toastr.error(response.message || 'Error al cargar las regiones.');
      }
    } catch (error) {
      // this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
  }

  async ngOnChanges(changes: SimpleChanges) {
  try {
    if (changes['modelo'] && !changes['modelo'].isFirstChange()) {

      this.spinnerService.showGlobalSpinner();
      this.patchFormValues();

      if (this.StateEnum == TipoAccion.Read) {
        this.barraBotones();
      }
    }

  }
  catch (error) {
    this.handleError(error);
  }
  finally {
    this.spinnerService.hideGlobalSpinner();
  }

}

barraBotones() {

  this.estadoBotones.btnSalir = true;

  if (this.StateEnum == TipoAccion.Read) {
    this.estadoBotones.btnNuevo = this.tienePermiso(Operacion.Crear);
    this.estadoBotones.btnModificar = (this.modelo && this.tienePermiso(Operacion.Modificar) == true) ? true : false;
    this.estadoBotones.btnGrabar = false;
  }
  else if (this.StateEnum == TipoAccion.Create || this.StateEnum == TipoAccion.Update) {
    this.estadoBotones.btnNuevo = false;
    this.estadoBotones.btnModificar = false;
    this.estadoBotones.btnGrabar = true;
  }

}

tienePermiso(codigo: string): boolean {
  let result: boolean = false;
  if (this.permissions && this.permissions.length > 0) {
    result = this.permissions.some((e: any) => e.codigo.toLowerCase() === codigo.toLowerCase());
  }

  return result;
}

private handleError(error: any) {
  this.toastr.error(cadenaErrores(error));
  this.spinnerService.hideGlobalSpinner();
}
    
ngAfterViewInit(): void {

  if (this.StateEnum === TipoAccion.Create || this.StateEnum === TipoAccion.Read ) {
    this.codigo.nativeElement.focus();
  }
  else {
    this.descripcion.nativeElement.focus();
  }

}
  

private initForm(): FormGroup {
  return this.formBuilder.group({
    codigo: ['' ,[Validators.required, Validators.maxLength(2), this.validationService.todoMayuscula()]], 
    descripcion: ['', [Validators.required, Validators.maxLength(50),  this.validationService.todoMayuscula()]], 
    codigoRegion: [, [Validators.required]],
    codigoDiscado: [null],
    codigoSRI: [null, Validators.maxLength(4)],
    activo: [true],
    esParaisoFiscal: [false],
    codigoSRIParaisoFiscal: [null, Validators.maxLength(4)],
    usuarioCreacion: [null],
    fechaCreacion: [null],
    equipoCreacion: [null],
    usuarioModificacion: [null],
    fechaModificacion: [null],
    equipoModificacion: [null],
  });
}

private patchFormValues() {
  if (this.StateEnum == TipoAccion.Update && this.modelo) {

    this.form.patchValue(
      {
        codigo: this.modelo.codigo,  
        codigoRegion: this.modelo.codigoRegion,     
        descripcion: this.modelo.descripcion,       
        codigoDiscado: this.modelo.codigoDiscado,  
        codigoSRI: this.modelo.codigoSRI,   
        activo: this.modelo.activo,    
        esParaisoFiscal: this.modelo.esParaisoFiscal,
        codigoSRIParaisoFiscal: this.modelo.codigoSRIParaisoFiscal,
        usuarioCreacion: this.modelo.usuarioCreacion,   
        fechaCreacion: this.modelo.fechaCreacion,   
        equipoCreacion: this.modelo.equipoCreacion,   
        usuarioModificacion: this.modelo.usuarioModificacion,   
        fechaModificacion: this.modelo.fechaModificacion,   
        equipoModificacion: this.modelo.equipoModificacion
      }
    );
  }
}

getInvalidControls() {
  const controls = this.form.controls;
  for (const name in controls) {
    if (controls[name].invalid) {
      this.form.controls[name].markAsTouched();
    }
  }
}

guardarCambios(): void {

  if (!this.form.valid)
  {
      this.getInvalidControls();
      this.toastr.warning('Debe llenar todos los campos');
      return;
  }

  const updateData = {
    usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : undefined,
    fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5() : undefined,
    usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
    fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5() : undefined,
  };
  this.form.patchValue(updateData);
  this.onSubmit.emit(this.form.value);
  
}

async cancelar() {
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
cancelarFormulario() {
  if (this.isModal) return;
  if (this.StateEnum == TipoAccion.Update || this.StateEnum == TipoAccion.Create) {
    // this.router.navigate(['/'+ this.entidad +'/ver']);
    this.router.navigate(['/'+ this.entidad +'/listado']);
  }
  else {
    this.router.navigate(['/'+ this.entidad +'/listado']);
  }
}

nuevoRegistro(): void {
  this.router.navigate(['/'+ this.entidad +'/nuevo']);
}

modificarRegistro(): void
{
  const id = this.form.get('codigo').value;
  if (id) {
    this.router.navigate(['/'+ this.entidad +'/modificar', id]);
  }
}

consultarRegistro():void
{
  const id = this.form.get('codigo').value;
  if (id) {
    this.router.navigate(['/'+ this.entidad +'/ver', id]);
  }

}


@HostListener('window:keydown', ['$event'])
handleKeyboardEvent(event: KeyboardEvent) {
  // Combinación para 'Alt+G' - Grabar
  if (event.altKey && event.key.toLowerCase() === 'g') {
    this.guardarCambios();
    event.preventDefault();
  }
  if (this.isModal) return;
  // Combinación para 'Alt+N' - Nuevo
  if (event.altKey && event.key.toLowerCase() === 'n') {
    this.nuevoRegistro();
    event.preventDefault();
  }
  // Combinación para 'Alt+M' - Modificar
  else if (event.altKey && event.key.toLowerCase() === 'm') {
    this.modificarRegistro();
    event.preventDefault();
  }
  // Combinación para 'Alt+C' - Cancelar
  else if (event.altKey && event.key.toLowerCase() === 'c') {
    this.cancelar();
    event.preventDefault();
  }
}

obtenerError(campoNombre: string): string {
  const campo = this.form.get(campoNombre);
  return campo ? this.validationService.obtenerMensajeError(campo) : '';
}

}
