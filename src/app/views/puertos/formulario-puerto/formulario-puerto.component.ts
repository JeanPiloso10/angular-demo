import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormValidationService } from '@core/services/form-validation.service';
import { SecurityService } from '@core/services/security.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { CiudadesService } from '../../ciudades/ciudades.service';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { PuertosService } from '../puertos.service';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { PermissionService } from '@core/services/permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formulario-puerto',
  templateUrl: './formulario-puerto.component.html',
  styleUrl: './formulario-puerto.component.scss',
  standalone:false
})
export class FormularioPuertoComponent {

  @Input() errores: string;
  @Input() modelo: any;  
  @Input() StateEnum: TipoAccion; 
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();

  tipoAccion = TipoAccion;
  customStylesValidated = false;
  ciudadWaterMark = 'Seleccione una Ciudad.';
  tiposPuertoWaterMark = 'Seleccione un Tipo de Puerto.';
  ciudades: any[];
  tiposPuerto: any[];
  ciudadFields: Object = { groupBy: 'provincia.pais.descripcion', text: 'descripcion', value: 'codigo' };
  tipoPuertoFields: Object = { text: 'descripcion', value: 'codigo' };

  @ViewChild('codigo') codigo!: ElementRef;
  @ViewChild('descripcion') descripcion!: ElementRef;
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;
  form: FormGroup;
  tituloFormulario: string;
  entidad = 'puerto';
  permissions:any[] = [];
  public allowCustomValue: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private validationService: FormValidationService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private ciudadesService: CiudadesService,
    private puertoService: PuertosService,
    private securityService: SecurityService,
    private permissionService: PermissionService
  ) {
    this.form = this.initForm();
  }

  ngOnInit(): void {
    // Suscripción a los cambios de valor del checkbox
    this.form.get('activo')?.valueChanges.subscribe((value) => {
      this.updateLabel(value);
    });
  
    // Inicializar el componente
    this.initializeComponent();
  }
  
  private async initializeComponent() {
    try {

      await this.getPermissions();
      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }
      this.spinnerService.showGlobalSpinner();
      await this.loadInitialData();
      this.form.get('activo').patchValue(true); 
      await this.patchFormValues();
      this.spinnerService.hideGlobalSpinner();
      // this.barraBotones();
      // this.codigoConfiguracion.focusIn();
  
      // Asegurarse de sincronizar el label después de inicializar los datos
      const initialValue = this.form.get('activo')?.value;
      this.updateLabel(initialValue);
    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
  };

  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.
        getPermissionByTransaction(TransactionCode.puerto).
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
    this.spinnerService.showGlobalSpinner();
    
    try {
      const [ciudadesResponse, tipoPuertoResponse]: [any, any] = await Promise.all([
        firstValueFrom(this.ciudadesService.todos()),
        firstValueFrom(this.puertoService.tipoPuerto())
      ]);
  
      this.spinnerService.hideGlobalSpinner();
      
      // Manejo de la respuesta de ciudades
      if (ciudadesResponse.isSuccess) {
        this.ciudades = ciudadesResponse.result;
      } else {
        this.toastr.error(ciudadesResponse.message || 'Error al cargar las ciudades.');
      }
  
      // Manejo de la respuesta de tipos de puerto
      if (tipoPuertoResponse.isSuccess) {
        this.tiposPuerto = tipoPuertoResponse.result;
      } else {
        this.toastr.error(tipoPuertoResponse.message || 'Error al cargar los tipos de puerto.');
      }

    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
  }
  
  ngAfterViewInit(): void {
    if(this.StateEnum === TipoAccion.Create)
      {
        this.codigo.nativeElement.focus();
      }
      else {
        this.descripcion.nativeElement.focus();
      }
    
  }

  
private initForm(): FormGroup {
  return this.formBuilder.group({
    codigo: ['', [Validators.required, Validators.maxLength(6),  this.validationService.todoMayuscula()]], 
    descripcion: ['', [Validators.required, Validators.maxLength(50),  this.validationService.todoMayuscula()]], 
    codigoCiudad: [, [Validators.required]],
    codigoTipoPuerto: [, [Validators.required]],
    activo: [true],
    usuarioCreacion: [null],
    fechaCreacion: [null],
    equipoCreacion: [null],
    usuarioModificacion: [null],
    fechaModificacion: [null],
    equipoModificacion: [null],
  });
}


private patchFormValues() {
  if (this.StateEnum !== TipoAccion.Create && this.modelo) {


    this.form.patchValue(
      {
        codigo: this.modelo.codigo,                   
        descripcion: this.modelo.descripcion,         
        codigoCiudad: this.modelo.codigoCiudad,  
        codigoTipoPuerto: this.modelo.codigoTipoPuerto,  
        activo: this.modelo.activo,
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


guardarCambios(): void {


  if (this.form.valid) {

    const updateData = {
      usuarioCreacion: this.StateEnum === TipoAccion.Create ? this.securityService.getUserName() : undefined,
      fechaCreacion: this.StateEnum === TipoAccion.Create ? obtenerFechaEnHusoHorarioMinus5() : undefined,
      usuarioModificacion: this.StateEnum === TipoAccion.Update ? this.securityService.getUserName() : undefined,
      fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5() : undefined,
    };
    this.form.patchValue(updateData);
    this.onSubmit.emit(this.form.value);
  }
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
  if (this.StateEnum == TipoAccion.Update || this.StateEnum == TipoAccion.Create) {
    // this.router.navigate(['/'+ this.entidad +'/ver']);
    this.router.navigate(['/'+ this.entidad +'/listado']);
  }
  else {
    this.router.navigate(['/'+ this.entidad +'/listado']);
  }
}

@HostListener('window:keydown', ['$event'])
handleKeyboardEvent(event: KeyboardEvent) {
  // Combinación para 'Alt+G' - Grabar
  if (event.altKey && event.key === 'g') {
    this.guardarCambios();
    event.preventDefault(); // Previene la acción por defecto (opcional)
  }
  // Combinación para 'Alt+C' - Cancelar
  else if (event.altKey && event.key === 'c') {
    this.cancelar();
    event.preventDefault(); // Previene la acción por defecto (opcional)
  }
}

updateLabel(value: boolean) {
  if (this.lblEstado && this.lblEstado.nativeElement) {
    this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
  }
}

obtenerError(campoNombre: string): string {
  
  
  const campo = this.form.get(campoNombre);
  if (campo && (campo.dirty || campo.touched) && campo.invalid) {
  return campo ? this.validationService.obtenerMensajeError(campo) : '';
  }
  else {
    return '';  
  }
}

}
