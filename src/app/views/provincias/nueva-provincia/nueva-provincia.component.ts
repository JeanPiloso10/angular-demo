import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoAccion } from '@shared/enums/TipoAccion'
import { ProvinciasService } from '../provincias.service'
import { cadenaErrores } from '@shared/utilities/parsearErrores'
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { FormularioProvinciaComponent } from '../formulario-provincia/formulario-provincia.component';
import { ButtonModule } from '@coreui/angular';

@Component({
  selector: 'app-nueva-provincia',
  templateUrl: './nueva-provincia.component.html',
  styleUrl: './nueva-provincia.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormularioProvinciaComponent,
    ButtonModule
  ]
})
export class NuevaProvinciaComponent {

  public StateEnum = TipoAccion.Create;
  public errores: string;

  @Input() codigoPais: string;
  @Output() submitEvent = new EventEmitter<any>();

  constructor(private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private activeModal: NgbActiveModal,
    private provinciasService: ProvinciasService) {
  }
  
  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.provinciasService.crear(data).pipe(
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
