import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionFirmaService } from '../configuracion-firma.service';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-nueva-configuracion-firma',
  templateUrl: './nueva-configuracion-firma.component.html',
  styleUrl: './nueva-configuracion-firma.component.scss',
  standalone:false
})
export class NuevaConfiguracionFirmaComponent {



StateEnum = TipoAccion.Create;
errores: string;
entidad = 'configuracionfirma';

constructor(
  private activeModal: NgbActiveModal,
  private router: Router,
  private configuracionFirmaService: ConfiguracionFirmaService,
  private spinnerService: SpinnerService,
  private toastr: ToastrService
) {}

guardarCambios(data: any) {
  this.spinnerService.showGlobalSpinner();
    this.configuracionFirmaService.crear(data).pipe(
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
