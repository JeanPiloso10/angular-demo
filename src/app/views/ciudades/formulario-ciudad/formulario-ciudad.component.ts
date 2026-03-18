import { Component, HostListener, EventEmitter, Input, 
  OnInit, Output, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup , Validators, ReactiveFormsModule } from '@angular/forms';
import { FormValidationService } from '@core/services/form-validation.service'
import { TipoAccion } from '@shared/enums/TipoAccion'
import { Router } from '@angular/router';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { ProvinciasService } from '../../provincias/provincias.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { SecurityService } from '@core/services/security.service'
import { obtenerFechaEnHusoHorarioMinus5 } from '@shared/utilities/formatearFecha'
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';
import { PermissionService } from '@core/services/permission.service';
import Swal from 'sweetalert2';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { ComboBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { CardModule, FormModule, GridModule as GridCoreUI } from '@coreui/angular';

@Component({
  selector: 'app-formulario-ciudad',
  templateUrl: './formulario-ciudad.component.html',
  styleUrl: './formulario-ciudad.component.scss',
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
export class FormularioCiudadComponent implements OnInit, AfterViewInit{

  @Input() errores: string;
  @Input() modelo: any;  
  @Input() StateEnum: TipoAccion;
  @Input() isModal = false;
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();

  tipoAccion = TipoAccion;
  customStylesValidated = false;
  localWaterMark = 'Seleccione una provincia.';
  provincias: any[];
  fields: Object = { groupBy: 'pais.descripcion', text: 'descripcion', value: 'codigo' };

  @ViewChild('codigo') codigo!: ElementRef;
  @ViewChild('descripcion') descripcion!: ElementRef;
  form: FormGroup;
  tituloFormulario: string;
  entidad = 'ciudad';
  permissions:any[] = [];
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private validationService: FormValidationService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private provinciasService: ProvinciasService,
    private securityService: SecurityService,
    private permissionService: PermissionService
  ) {
    this.form = this.initForm();
  }

  
  ngOnInit(): void {
    this.initializeComponent();
  }

  private async initializeComponent() {

    try {
    if (!this.isModal) {
      await this.getPermissions();
      if (!this.permissions || this.permissions.length === 0) {
        return; // Detener el flujo si no hay permisos
      }
    }

    this.spinnerService.showGlobalSpinner();
  
      const response: any = await firstValueFrom(this.provinciasService.todos());
      this.spinnerService.hideGlobalSpinner();
      if (response.isSuccess) {
        
        this.provincias = response.result;
        
        this.patchFormValues();
      } else {
        this.toastr.error(response.message || 'Error al cargar las provincias.');
      }
    } catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
  }

  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.
        getPermissionByTransaction(TransactionCode.ciudad).
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
    codigo: ['', [Validators.required, Validators.maxLength(6)]], 
    descripcion: ['', [Validators.required, Validators.maxLength(50)]], 
    codigoProvincia: [, [Validators.required]],
    usuarioCreacion: [null],
    fechaCreacion: [null],
    equipoCreacion: [null],
    usuarioModificacion: [null],
    fechaModificacion: [null],
    equipoModificacion: [null],
  });
}


private patchFormValues() {
  if (this.StateEnum === TipoAccion.Create && this.modelo && this.modelo.codigoProvincia) {
    this.form.patchValue({ codigoProvincia: this.modelo.codigoProvincia });
  }
  else if (this.StateEnum !== TipoAccion.Create && this.modelo) {

    this.form.patchValue(
      {
        codigo: this.modelo.codigo,     
        codigoProvincia: this.modelo.codigoProvincia,        
        descripcion: this.modelo.descripcion,         
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
  if (this.isModal) return;
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
    event.preventDefault();
  }
  if (this.isModal) return;
  // Combinación para 'Alt+C' - Cancelar
  if (event.altKey && event.key === 'c') {
    this.cancelar();
    event.preventDefault();
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
