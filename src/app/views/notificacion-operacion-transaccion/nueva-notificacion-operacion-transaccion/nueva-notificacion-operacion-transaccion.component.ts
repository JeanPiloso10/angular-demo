import { Component, inject, Output,EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { NotificacionOperacionTransaccionService } from '../notificacion-operacion-transaccion.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-nueva-notificacion-operacion-transaccion',
  standalone: false,
  templateUrl: './nueva-notificacion-operacion-transaccion.component.html',
  styleUrl: './nueva-notificacion-operacion-transaccion.component.scss'
})
export class NuevaNotificacionOperacionTransaccionComponent {


  @Output() submitEvent = new EventEmitter<any>();

  StateEnum = TipoAccion.Create;
  errores: string;
  entidad = 'notificacionOperacionTransaccion';
  titulo: string;
  modelo:string
  

  constructor(private notificacionOperacionTransaccionService: NotificacionOperacionTransaccionService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService,
              private activeModal: NgbActiveModal)
  {

  }
  

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.notificacionOperacionTransaccionService.crear(data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        this.spinnerService.hideGlobalSpinner();
        if (respuesta.isSuccess && respuesta.isSuccess == true) {
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
