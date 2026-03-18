import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OperacionTransaccionService } from '../operacion-transaccion.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-nuevo-operacion-transaccion',
  templateUrl: './nuevo-operacion-transaccion.component.html',
  styleUrl: './nuevo-operacion-transaccion.component.scss',
  standalone:false
})
export class NuevoOperacionTransaccionComponent {

  


  StateEnum = TipoAccion.Create;
  errores: string;
  entidad = 'operaciontransaccion';

constructor(private router: Router,
  private operacionTransaccionService: OperacionTransaccionService,
  private spinnerService: SpinnerService,
  private toastr: ToastrService) {

}

  
guardarCambios(data: any) {
  this.spinnerService.showGlobalSpinner();
  this.operacionTransaccionService.crear(data).pipe(
    finalize(() => this.spinnerService.hideGlobalSpinner())
  ).subscribe({
    next: (respuesta: any) => {
      this.spinnerService.hideGlobalSpinner();
      if (respuesta.isSuccess && respuesta.isSuccess==true) {

        this.toastr.success('Acción exitosa');
        this.router.navigate(['/'+this.entidad]);
      }
      else {
        this.toastr.error(cadenaErrores(respuesta.message));
      }

      
    },
    error: (error) => {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error(cadenaErrores(error));
    }
  });
}

}
