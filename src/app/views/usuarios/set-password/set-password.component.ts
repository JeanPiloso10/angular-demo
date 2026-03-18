import { Component, Input, ViewChildren, inject, ViewChild , ElementRef, QueryList} from '@angular/core';
import { FormBuilder, FormGroup , Validators, ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { UsuariosService } from '../usuarios.service';
import { FormValidationService } from '@core/services/form-validation.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  ButtonGroupModule,
  SpinnerModule
} from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '@app/icons/icon-subset';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    FormModule,
    GridModule,
    ButtonGroupModule,
    SpinnerModule,
    IconModule
  ],
  providers: [
    {
      provide: IconSetService,
      useFactory: () => {
        const iconSet = new IconSetService();
        iconSet.icons = { ...iconSubset };
        return iconSet;
      }
    }
  ]
})
export class SetPasswordComponent {

    
  @Input() errores: string[] = [];
  @Input() id: any; 
  @Input() username: any; 

  @ViewChild('inputNewPassword') inputPassword!: ElementRef;
  @ViewChildren('inputNewPassword, inputNewPasswordRepeat') inputs!: QueryList<ElementRef>;


  form: FormGroup;
  loading = false;
  showNewPassword = false;
  showNewPasswordRepeat = false;


  constructor(private formBuilder : FormBuilder,
              private userService : UsuariosService,
              private toastr : ToastrService,
              private activeModal: NgbActiveModal,
              private validationService : FormValidationService) {
    this.form = this.initForm();
  }
  

  initForm(): FormGroup{
    return this.formBuilder.group({
      UserName: [''],
      NewPassword: ['', {validators: [Validators.required, Validators.minLength(6)]}] ,
      NewPasswordRepeat: ['', {validators: [Validators.required, Validators.minLength(6)]}]}, 
                    { validators: this.validationService.ConfirmedValidator('NewPassword', 'NewPasswordRepeat') });
}




  ngOnInit(): void {

     this.form.patchValue(
    {
      UserName: this.username
    });

  }

  onKeydown(event: KeyboardEvent, controlName: string) {
    if (event.key === "Enter") {
      event.preventDefault();
  
      // Obtiene el control de formulario usando el nombre pasado y lo marca como touched
      const control = this.form.get(controlName);
      if (control) {
        control.markAsTouched();
      }
  
      // La lógica para mover el foco al siguiente input sigue igual
      const index = this.inputs.toArray().findIndex(input => input.nativeElement === event.target);
      if (index >= 0 && index < this.inputs.length - 1) {
        const nextInput = this.inputs.toArray()[index + 1].nativeElement;
        nextInput.focus();
      } else if (index === this.inputs.length - 1) {
        this.inputs.first.nativeElement.focus();
      }
    }
  }

  guardarCambios() {
    this.loading = true;
    this.userService.setPassword(this.id, this.form.value).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (respuesta) => {
        this.loading = false;
        this.toastr.success('Contraseña actualizada correctamente.');
        this.cerrar();
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error));
      }
    });
  };

  ngAfterViewInit(): void {
     setTimeout(() => {
          this.inputPassword.nativeElement.focus();
        }, 100);
  }

  obtenerError(campoNombre: string): string {
    const campo = this.form.get(campoNombre);
    if(campo)
      {
        return ((campo.dirty || campo.touched) && campo.invalid) ? this.validationService.obtenerMensajeError(campo) : '';
      }
      else
      {
        return '';
      }
  }
  
  togglePasswordVisibility(field: 'new' | 'repeat') {
    if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showNewPasswordRepeat = !this.showNewPasswordRepeat;
    }
  }
  
  
  cerrar()
  {

    if(this.loading) 
    {
      this.toastr.warning('Por favor, espere a que se complete la operación actual antes de cerrar el modal.');
      return;
    }
    
    this.activeModal.close(); 
  }


}
