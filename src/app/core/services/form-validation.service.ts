import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { VALIDATION_MESSAGES } from '../models/validation-messages';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor() { }

  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors['confirmedValidator']
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  NotEqualValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors['notEqualValidator']
      ) {
        return;
      }
      if (control.value === matchingControl.value) {
        matchingControl.setErrors({ notEqualValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  obtenerMensajeError(campo: AbstractControl): string {
    if (!campo) return '*Este campo es requerido';
 
    for (const errorKey in campo.errors) {
      if (campo.hasError(errorKey)) {
        let mensaje = VALIDATION_MESSAGES[errorKey]; // Obtiene el mensaje base usando la clave del error
        const errorParams = campo.getError(errorKey);
        if (errorParams) {
          // Itera a través de los parámetros del error para reemplazar los placeholders en el mensaje
          Object.keys(errorParams).forEach(param => {
            // Reemplaza el placeholder con el valor actual. Asegúrate de convertir todo a string.
            mensaje = mensaje.replace(`{${param}}`, errorParams[param].toString());
          });
        }
 
        return mensaje; // Devuelve el mensaje de error ya procesado
      }
    }
    return '';
  }

  
 primeraLetraMayuscula(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {

      const valor = <string>control.value;
      if (!valor) return null;
      if (valor.length === 0) return null;

      
      const primeraLetra = valor[0];
      if (primeraLetra !== primeraLetra.toUpperCase()){
          return {
              primeraLetraMayuscula: {
              mensaje: 'La primera letra debe ser mayúscula'
          }
          };
      }
      else
      {
        return null;
      }
    };    
}

todoMayuscula(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {

    const valor = <string>control.value;
    if (!valor) return null;
    if (valor.length === 0) return null;

    if (valor !== valor.toUpperCase()){
      return {
        todoMayuscula: {
          mensaje: 'Todo el texto debe estar en mayúsculas'
        }
      };
    }
    else
    {
      return null;
    }
  };    
}


// todoMayuscula(): AsyncValidatorFn {
//   return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
//     return new Promise(resolve => {
//       const valor = control.value;
//       // Simula una validación asíncrona
//       setTimeout(() => {
//         if (valor && valor !== valor.toUpperCase()) {
//           resolve({ 'todoMayuscula': true });
//         } else {
//           resolve(null);
//         }
//       }, 1000);
//     });
//   };
// }


}

