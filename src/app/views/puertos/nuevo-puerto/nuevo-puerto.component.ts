import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { PuertosService } from '../puertos.service';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-nuevo-puerto',
  templateUrl: './nuevo-puerto.component.html',
  styleUrl: './nuevo-puerto.component.scss',
  standalone:false
})
export class NuevoPuertoComponent {


StateEnum = TipoAccion.Create;
errores: string;
padre_id: null;
entidad = 'puerto';

constructor(private router: Router,
  private puertoService: PuertosService,
  private spinnerService: SpinnerService,
  private toastr: ToastrService) {

}

  
guardarCambios(data: any) {
  this.spinnerService.showGlobalSpinner();
  this.puertoService.crear(data).pipe(
    finalize(() => this.spinnerService.hideGlobalSpinner())
  ).subscribe({
    next: (respuesta: any) => {
      if (respuesta.isSuccess && respuesta.isSuccess==true) {
        this.toastr.success('Acción exitosa');
        this.router.navigate(['/'+this.entidad]);
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
