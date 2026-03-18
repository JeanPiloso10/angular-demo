import { Component, HostListener, EventEmitter, Input, 
         OnInit, Output, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { FormBuilder, FormGroup , Validators } from '@angular/forms';
import { FormValidationService } from '@core/services/form-validation.service'
import { TipoAccion } from '@shared/enums/TipoAccion'
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { PermissionService } from '@core/services/permission.service';
import { TransactionCode } from '@shared/enums/TransactionCode';
import { OperacionesDto } from '@core/models/operaciones-dto';

@Component({
  selector: 'app-formulario-rol',
  templateUrl: './formulario-rol.component.html',
  styleUrl: './formulario-rol.component.scss',
  standalone:false
})
export class FormularioRolComponent implements OnInit, AfterViewInit {




  @Input() modelo: any;  
  @Input() StateEnum: TipoAccion; 
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
  customStylesValidated = false;
  permissions:any[] = [];
  
  @ViewChild('rolName') rolName!: ElementRef;
  form = this.initForm();
  tituloFormulario: string;

  constructor(private formBuilder: FormBuilder,
              private validationService: FormValidationService,
              private router: Router,
              private toastr: ToastrService,
              private permissionService: PermissionService) {
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  private async initializeComponent() {
    try {
      await this.getPermissions();
      this.setTituloFormulario();
      if (this.StateEnum !== TipoAccion.Create && this.modelo) {
        
        this.form.patchValue(
          {
            Name: this.modelo.name,          
          }
        );
      }
    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
   
  }

  async getPermissions() {
    try {

      const results = await firstValueFrom(forkJoin({
        permission: this.permissionService.getPermissionByTransaction(TransactionCode.rolUsuario).pipe(catchError(error => of({ result: [] })))
  
      }));

      
  
          this.permissions = results.permission.result as OperacionesDto[];

          if (this.permissions.length === 0) {
            this.router.navigate(['/pages/403']);
        }
      

    } catch (error) {
      this.toastr.error(cadenaErrores(error));
    }
  }


ngAfterViewInit(): void {
  this.rolName.nativeElement.focus();

}

private setTituloFormulario(): void {
  this.tituloFormulario = this.StateEnum === TipoAccion.Create ? 'Nuevo rol' : 'Modificar rol';
}

private initForm(): FormGroup {
  return this.formBuilder.group({
    Name: ['', [Validators.required, Validators.minLength(3), this.validationService.primeraLetraMayuscula()]]
  });
}


guardarCambios(): void {
  this.customStylesValidated = true;
  if (this.form.valid) {
    this.onSubmit.emit(this.form.value);
  }
}

cancelar():void {
  this.router.navigate(['/rol']);
}

obtenerError(campoNombre: string): string {
  const campo = this.form.get(campoNombre);
  return campo ? this.validationService.obtenerMensajeError(campo) : '';
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

}
