import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '@core/services/spinner.service';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { TipoArchivoAnexoTransaccionService } from '../tipo-archivo-anexo-transaccion.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-tipo-archivo-anexo-transaccion',
  standalone: false,
  templateUrl: './modificar-tipo-archivo-anexo-transaccion.component.html',
  styleUrl: './modificar-tipo-archivo-anexo-transaccion.component.scss'
})
export class ModificarTipoArchivoAnexoTransaccionComponent {
  @Input() id: number; // Recibir el id como entrada



  StateEnum = TipoAccion.Update;
  errores: string[];
  entidad = 'secuencias';
  modelo: any;

  constructor(
    private activeModal: NgbActiveModal,
    private tipoArchivoAnexoTransaccionService: TipoArchivoAnexoTransaccionService,
    private spinnerService: SpinnerService,
    private toastr: ToastrService) {
   
  }

  ngOnInit(): void {
    this.loadModelo();
  }

  private loadModelo(): void {
    this.spinnerService.showGlobalSpinner();
    this.tipoArchivoAnexoTransaccionService.consultaId(this.id).pipe(
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

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.tipoArchivoAnexoTransaccionService.editar(this.modelo.idTipoArchivoAnexoTransaccion,data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess && respuesta.isSuccess==true) {
          this.toastr.success('Acción exitosa');
          this.cerrar();
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

  cerrar() {
    this.activeModal.close(); 
  }
}

