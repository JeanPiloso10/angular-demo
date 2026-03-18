import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { TransaccionService } from '../transaccion.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-nueva-transaccion',
  templateUrl: './nueva-transaccion.component.html',
  styleUrl: './nueva-transaccion.component.scss',
  standalone:false
})
export class NuevaTransaccionComponent {



  StateEnum = TipoAccion.Create;
  errores: string;

constructor(
              private toastr: ToastrService,
              private spinnerService: SpinnerService,
              private router: Router,
              private transaccionService: TransaccionService) {
  
}

  
guardarCambios(data: any) {
  this.spinnerService.showGlobalSpinner();
  this.transaccionService.crear(data).pipe(
    finalize(() => this.spinnerService.hideGlobalSpinner())
  ).subscribe({
    next: (respuesta: any) => {
      if (respuesta.isSuccess && respuesta.isSuccess==true) {
        this.toastr.success('Acción exitosa');
        this.router.navigate(['/transaccion']);
      }
      else {
        this.toastr.error(cadenaErrores(respuesta.message));
      }
    },
    error: (error) => {
      this.toastr.error(cadenaErrores(error));
    }
  });
}

}
