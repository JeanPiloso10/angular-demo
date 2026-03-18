import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormValidationService } from '@core/services/form-validation.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { OperacionTransaccionService } from '../operacion-transaccion.service';
import { SecurityService } from '@core/services/security.service';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { OperacionService } from '../../operacion/operacion.service';
import { TransaccionService } from '../../transaccion/transaccion.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { PermissionService } from '@core/services/permission.service';

@Component({
  selector: 'app-formulario-operacion-transaccion',
  templateUrl: './formulario-operacion-transaccion.component.html',
  styleUrl: './formulario-operacion-transaccion.component.scss',
  standalone:false
})
export class FormularioOperacionTransaccionComponent  implements OnInit, AfterViewInit {

  
  @Input() errores: string;
  @Input() modelo: any;  
  @Input() StateEnum: TipoAccion; 
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();

  customStylesValidated = false;
  localWaterMark = 'Seleccione un item.';

  operaciones: any[];
  transacciones: any[];
  permissions:any[] = [];

  fieldsTransaccion: Object = { text: 'descripcion', value: 'codigo' };
  fieldsOperacion: Object = { text: 'descripcion', value: 'codigo' };

  @ViewChild('codigoTransaccion') codigoTransaccion!: DropDownListComponent;
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;
  form: FormGroup;
  tituloFormulario: string;
  entidad = 'operaciontransaccion';
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private validationService: FormValidationService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private operacionTransaccionService: OperacionTransaccionService,
    private operacionService: OperacionService,
    private transaccionService: TransaccionService,
    private securityService: SecurityService,
    private permissionService : PermissionService  ) {
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
      this.form.get('activo').patchValue(true);
      await this.patchFormValues();
      await this.loadInitialData();
      // this.barraBotones();
      // this.codigoConfiguracion.focusIn();
  
      // Asegurarse de sincronizar el label después de inicializar los datos
      const initialValue = this.form.get('activo')?.value;
      this.updateLabel(initialValue);
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  
  private async loadInitialData() {
    this.spinnerService.showGlobalSpinner();
    try {
      const responseOperacion: any = await firstValueFrom(this.operacionService.todos());
      this.spinnerService.hideGlobalSpinner();
      if (responseOperacion.isSuccess) {
        this.operaciones = responseOperacion.result;        
      } else {
        this.toastr.error(responseOperacion.message || 'Error al cargar las operaciones.');
      }

      const responseTransaccion: any = await firstValueFrom(this.transaccionService.todos());
      if (responseTransaccion.isSuccess) {
        this.transacciones = responseTransaccion.result;        
      } else {
        this.toastr.error(responseTransaccion.message || 'Error al cargar las transacciones.');
      }

      this.patchFormValues();

    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
  }

  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.operacionTransaccion).pipe(catchError(error => of({ result: [] })))
  
      }));

        this.permissions = results.permission.result as OperacionesDto[];

        if (this.permissions.length === 0) {
          this.router.navigate(['/pages/403']);
      };
      

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
        this.codigoTransaccion.focusIn();
      }, 100);
  }

  
private initForm(): FormGroup {
  return this.formBuilder.group({
    idOperacionTransaccion:  [0],  
    codigoTransaccion: ['', [Validators.required]], 
    codigoOperacion: ['', [Validators.required]], 
    controlador: [''], 
    accion: [''], 
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
        idOperacionTransaccion: this.modelo.idOperacionTransaccion,
        codigoTransaccion: this.modelo.codigoTransaccion,     
        codigoOperacion: this.modelo.codigoOperacion, 
        controlador: this.modelo.controlador,         
        accion: this.modelo.accion, 
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

cancelar():void {
  this.router.navigate(['/'+this.entidad]);
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

obtenerError(campoNombre: string): string {
  const campo = this.form.get(campoNombre);
  return campo ? this.validationService.obtenerMensajeError(campo) : '';
}

updateLabel(value: boolean) {
  if (this.lblEstado && this.lblEstado.nativeElement) {
    this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
  }
}


}
