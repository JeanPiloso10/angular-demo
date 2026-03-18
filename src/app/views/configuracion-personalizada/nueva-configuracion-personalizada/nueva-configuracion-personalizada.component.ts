import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionPersonalizadaService } from '../configuracion-personalizada.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-nueva-configuracion-personalizada',
  templateUrl: './nueva-configuracion-personalizada.component.html',
  styleUrl: './nueva-configuracion-personalizada.component.scss',
  standalone:false
})
export class NuevaConfiguracionPersonalizadaComponent {

  

StateEnum = TipoAccion.Create;
errores: string;
entidad = 'secuencias';

constructor(private toastr: ToastrService,
            private spinnerService: SpinnerService,
            private router: Router,
            private activeModal: NgbActiveModal,
            private configuracionPersonalizadaService: ConfiguracionPersonalizadaService) {
}
  
guardarCambios(data: any) {
  this.spinnerService.showGlobalSpinner();
  this.configuracionPersonalizadaService.crear(data).pipe(
    finalize(() => this.spinnerService.hideGlobalSpinner())
  ).subscribe({
    next: (respuesta: any) => {
      this.spinnerService.hideGlobalSpinner();
      if (respuesta.isSuccess && respuesta.isSuccess==true) {

        this.toastr.success('Acción exitosa');
        this.activeModal.close();
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

cerrar() {
  this.activeModal.close(); 
}


}
