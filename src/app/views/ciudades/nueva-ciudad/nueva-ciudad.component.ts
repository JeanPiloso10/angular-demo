import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { CiudadesService } from '../ciudades.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { FormularioCiudadComponent } from '../formulario-ciudad/formulario-ciudad.component';
import { ButtonModule } from '@coreui/angular';

@Component({
  selector: 'app-nueva-ciudad',
  templateUrl: './nueva-ciudad.component.html',
  styleUrl: './nueva-ciudad.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormularioCiudadComponent,
    ButtonModule
  ]
})
export class NuevaCiudadComponent {

  public StateEnum = TipoAccion.Create;
  public errores: string;

  @Input() codigoProvincia: string;
  @Output() submitEvent = new EventEmitter<any>();

  constructor(private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private activeModal: NgbActiveModal,
    private ciudadService: CiudadesService) {
  }
  
  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.ciudadService.crear(data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        this.spinnerService.hideGlobalSpinner();
        if (respuesta.isSuccess && respuesta.isSuccess==true) {
          this.toastr.success('Acción exitosa');
          this.submitEvent.emit(respuesta.result);
          this.cerrar();
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
