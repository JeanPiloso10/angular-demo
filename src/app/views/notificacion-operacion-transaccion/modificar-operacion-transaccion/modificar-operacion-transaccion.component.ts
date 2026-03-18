import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { NotificacionOperacionTransaccionService } from '../notificacion-operacion-transaccion.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-operacion-transaccion',
  standalone: false,
  templateUrl: './modificar-operacion-transaccion.component.html',
  styleUrl: './modificar-operacion-transaccion.component.scss'
})
export class ModificarOperacionTransaccionComponent implements OnInit {

  @Output() submitEvent = new EventEmitter<any>();
  @Input() idNotificacionOperacionTransaccion?: number;
  @Input() titulo = 'Modificar';

  errores?: string;
  modelo: any;
  StateEnum = TipoAccion.Update;

  constructor(
    private notificacionOperacionTransaccionService: NotificacionOperacionTransaccionService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService,
    private activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    if (!this.idNotificacionOperacionTransaccion) {
      this.toastr.error('No se pudo obtener el identificador del registro.');
      this.cerrar();
      return;
    }

    this.cargarModelo(this.idNotificacionOperacionTransaccion);
  }

  private cargarModelo(id: number): void {
    this.spinnerService.showGlobalSpinner();
    this.notificacionOperacionTransaccionService.consultaId(id).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta) => {
        if (respuesta.isSuccess) {
          this.modelo = respuesta.result;
        } else {
          this.toastr.error(cadenaErrores(respuesta.message));
          this.cerrar();
        }
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error));
        this.cerrar();
      }
    });
  }

  guardarCambios(data: any): void {
    if (!this.idNotificacionOperacionTransaccion) {
      return;
    }

    this.spinnerService.showGlobalSpinner();
    this.notificacionOperacionTransaccionService.editar(this.idNotificacionOperacionTransaccion, data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess) {
          this.toastr.success('Acción exitosa');
          this.submitEvent.emit(respuesta.result);
          this.cerrar();
        } else {
          this.toastr.error(cadenaErrores(respuesta.message));
        }
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error));
      }
    });
  }

  cerrar(): void {
    this.activeModal.close();
  }

}
