import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { PaisesService } from '../paises.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { FormularioPaisComponent } from '../formulario-pais/formulario-pais.component';
import { ButtonModule } from '@coreui/angular';

@Component({
  selector: 'app-nuevo-pais',
  templateUrl: './nuevo-pais.component.html',
  styleUrl: './nuevo-pais.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormularioPaisComponent,
    ButtonModule
  ]
})
export class NuevoPaisComponent {

  public StateEnum = TipoAccion.Create;
  public errores: string;

  @Output() submitEvent = new EventEmitter<any>();

  constructor(private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private activeModal: NgbActiveModal,
    private paisService: PaisesService) {
  }
  
  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.paisService.crear(data).pipe(
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
