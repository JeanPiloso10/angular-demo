import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormValidationService } from '@core/services/form-validation.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { SecurityService } from '@core/services/security.service';
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { PermissionService } from '@core/services/permission.service';


@Component({
  selector: 'app-formulario-configuracion',
  templateUrl: './formulario-configuracion.component.html',
  styleUrl: './formulario-configuracion.component.scss',
  standalone:false
})
export class FormularioConfiguracionComponent {

  
  @Input() errores: string;
  @Input() modelo: any;  
  @Input() StateEnum: TipoAccion; 
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('codigoTransaccion', { static: false }) codigoTransaccion!: ComboBoxComponent;
  @ViewChild('codigo') codigo!: ElementRef;
  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;
  customStylesValidated = false;
  localWaterMark = 'Seleccione un item.';
  tipoAccion= TipoAccion;
  form: FormGroup;
  entidad = 'configuraciones';
  permissions:any[] = [];
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private validationService: FormValidationService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private securityService: SecurityService,
    private permissionService: PermissionService
  ) {
    this.form = this.initForm();
  }

  
  ngOnInit(): void {
    // Suscripción a los cambios de valor del checkbox
    this.form.get('activo')?.valueChanges.subscribe({

      next: (value) => {
   
        this.updateLabel(value);
      },
      error: (err) => {
        console.error(err);
      }
      
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
   
      // this.setupValueChanges();
  
      // Asegurarse de sincronizar el label después de inicializar los datos
      const initialValue = this.form.get('activo')?.value;
      this.updateLabel(initialValue);
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  
  async getPermissions() {
    try {
  
      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.configuracion).pipe(catchError(error => of({ result: [] })))
  
      }));
  
        this.permissions = results.permission.result as OperacionesDto[];
  
        if (this.permissions.length === 0) {
          this.router.navigate(['/pages/403']);
      };
      
  
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }

  updateLabel(value: boolean) {
  
    if (this.lblEstado && this.lblEstado.nativeElement) {

      this.lblEstado.nativeElement.textContent = value ? 'Activo' : 'Inactivo';
    }
  }

  

  
ngAfterViewInit(): void {

    this.codigo.nativeElement.focus();
}

private initForm(): FormGroup {
  return this.formBuilder.group({
    idConfiguracion:  [0],  
    codigo: ['', [Validators.required,Validators.maxLength(5)]], 
    descripcion: ['', [Validators.required, Validators.maxLength(200)]], 
    valorPorDefecto: [null, [Validators.maxLength(256)]], 
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
  if (this.modelo) {


    this.form.patchValue(
      {
        idConfiguracion: this.modelo.idConfiguracion,
        codigo: this.modelo.codigo,     
        descripcion: this.modelo.descripcion, 
        valorPorDefecto: this.modelo.valorPorDefecto,         
      
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
      fechaModificacion: this.StateEnum === TipoAccion.Update ? obtenerFechaEnHusoHorarioMinus5(): undefined,
    };

    this.form.patchValue(updateData);
    this.onSubmit.emit(this.form.getRawValue());
  }
}


cancelar():void {
  this.router.navigate(['/'+this.entidad+'/listado']);
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





}
