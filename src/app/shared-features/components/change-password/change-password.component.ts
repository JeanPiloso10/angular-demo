import { Component, Input, ViewChild, ViewChildren, ElementRef , AfterViewInit, QueryList, inject } from '@angular/core';
import { FormBuilder, FormGroup , Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuariosService } from '../../../views/usuarios/usuarios.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { FormValidationService } from '@core/services/form-validation.service'
import { finalize } from 'rxjs';
import {  ButtonModule,
          CardModule,
          FormModule,
          GridModule,
          ButtonGroupModule,
          BadgeModule,
          SpinnerModule} from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '@app/icons/icon-subset';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
  standalone: true,
  imports: [ButtonModule,
            CardModule,
            FormModule,
            GridModule,
            ButtonGroupModule,
            BadgeModule,
            SpinnerModule,
            ReactiveFormsModule,
            CommonModule,
            IconModule],
  providers: [{
    provide: IconSetService,
    useFactory: () => {
      const iconSet = new IconSetService();
      iconSet.icons = { ...iconSubset };
      return iconSet;
    }
  }]
})
export class ChangePasswordComponent implements AfterViewInit {
  loading = false;
  changePassword: any;
  form: FormGroup;

  // visibility state for password fields
  showPassword = false; // current password
  showNewPassword = false;
  showNewPasswordRepeat = false;

  @Input() errores: string[] = [];
  @ViewChild('inputPassword') inputPassword!: ElementRef;
  @ViewChildren('inputPassword, inputNewPassword, inputNewPasswordRepeat') inputs!: QueryList<ElementRef>;


  constructor(  
  private  formBuilder : FormBuilder,
  private  userService : UsuariosService,
  private  toastr : ToastrService,
  private  validationService : FormValidationService,
  private  activeModal : NgbActiveModal) {

    this.form = this.initForm();

  };

  togglePasswordVisibility(field: 'current' | 'new' | 'repeat') {
    switch (field) {
      case 'current':
        this.showPassword = !this.showPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'repeat':
        this.showNewPasswordRepeat = !this.showNewPasswordRepeat;
        break;
    }
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

    initForm(): FormGroup{
      return this.formBuilder.group({
        Password: ['', {validators: [Validators.required, Validators.minLength(6)]}],
        NewPassword: ['', {validators: [Validators.required, Validators.minLength(6)]}] ,
        NewPasswordRepeat: ['', {validators: [Validators.required, Validators.minLength(6)]}]
  }, { validators: this.validationService.ConfirmedValidator('NewPassword', 'NewPasswordRepeat') });
    }

    ngAfterViewInit(): void {
       setTimeout(() => {
          this.inputPassword.nativeElement.focus();
        }, 100);
    }

  

    guardarCambios() {
      this.loading = true;
      this.userService.changePassword(this.form.value).pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: (respuesta) => {
          this.toastr.success('Contraseña actualizada correctamente.');
          this.cerrar();
        },
        error: (error) => {
          this.toastr.error(cadenaErrores(error));
        }
      });
    };

  
    
obtenerError(campoNombre: string): string {
  const campo = this.form.get(campoNombre);
  return ((campo.dirty || campo.touched) && campo.invalid) ? this.validationService.obtenerMensajeError(campo) : '';
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
