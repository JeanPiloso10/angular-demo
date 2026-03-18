import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { FormBuilder, FormGroup , Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SecurityService } from '@core/services/security.service';
import { SpinnerService } from '@core/services/spinner.service';
import { FormValidationService } from '@core/services/form-validation.service'
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha'
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { PermissionService } from '@core/services/permission.service';
import { OperacionesDto } from '@core/models/operaciones-dto';

@Component({
  selector: 'app-formulario-operacion',
  templateUrl: './formulario-operacion.component.html',
  styleUrl: './formulario-operacion.component.scss',
  standalone:false
})
export class FormularioOperacionComponent implements OnInit, AfterViewInit  {

  @Input() errores: string;
  @Input() modelo: any;  
  @Input() StateEnum: TipoAccion; 
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  tipoAccion= TipoAccion;

  @ViewChild('lblEstado') lblEstado!: ElementRef<HTMLLabelElement>;
  @ViewChild('codigo') codigo!: ElementRef;
  form: FormGroup;
  tituloFormulario: string;
  permissions:any[] = [];

  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private validationService: FormValidationService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private securityService: SecurityService,
    private permissionService : PermissionService)
   {
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
      // await this.loadInitialData();

  
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
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.operaciones).pipe(catchError(error => of({ result: [] })))
  
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
    idOperacion:  [0],  
    codigo: ['', [Validators.required, Validators.maxLength(5), this.validationService.todoMayuscula()]], 
    descripcion: ['', [Validators.required, Validators.maxLength(50),  this.validationService.todoMayuscula()]], 
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
        idOperacion: this.modelo.idOperacion,
        codigo: this.modelo.codigo,  
        descripcion: this.modelo.descripcion,       
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
  this.router.navigate(['/operacion']);
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


