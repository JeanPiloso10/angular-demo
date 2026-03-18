import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OperacionService } from '../operacion.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-nueva-operacion',
  templateUrl: './nueva-operacion.component.html',
  styleUrl: './nueva-operacion.component.scss',
  standalone:false
})
export class NuevaOperacionComponent {



StateEnum = TipoAccion.Create;
errores: string;

constructor(private router: Router,
  private operacionService: OperacionService,
  private spinnerService: SpinnerService,
  private toastr: ToastrService) {

}

  
guardarCambios(data: any) {
  this.spinnerService.showGlobalSpinner();
  this.operacionService.crear(data).pipe(
    finalize(() => this.spinnerService.hideGlobalSpinner())
  ).subscribe({
    next: (respuesta: any) => {
      this.spinnerService.hideGlobalSpinner();
      if (respuesta.isSuccess && respuesta.isSuccess==true) {

        this.toastr.success('Acción exitosa');
        this.router.navigate(['/operacion']);
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
