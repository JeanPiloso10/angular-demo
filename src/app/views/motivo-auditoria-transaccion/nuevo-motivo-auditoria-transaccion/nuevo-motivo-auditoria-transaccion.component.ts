import { Component, inject, ViewChild } from '@angular/core';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormularioMotivoAuditoriaTransaccionComponent } from '../formulario-motivo-auditoria-transaccion/formulario-motivo-auditoria-transaccion.component';
import { MotivoAuditoriaTransaccionService } from '../motivo-auditoria-transaccion.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-nuevo-motivo-auditoria-transaccion',
  templateUrl: './nuevo-motivo-auditoria-transaccion.component.html',
  styleUrl: './nuevo-motivo-auditoria-transaccion.component.scss',
  standalone:false
})
export class NuevoMotivoAuditoriaTransaccionComponent {


  @ViewChild(FormularioMotivoAuditoriaTransaccionComponent) formulario: FormularioMotivoAuditoriaTransaccionComponent;

  codigoTransaccion: any;
  modelo: any;
  errores: string[] = [];
  entidad = 'tipoArchivoTransaccionAnexo';
  titulo: string;
  public StateEnum = TipoAccion.Create;

  constructor(private motivoAuditoriaTransaccionService: MotivoAuditoriaTransaccionService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService,
              private activeModal: NgbActiveModal) {
    this.titulo = "Crear Nuevo"
  }

  ngOnInit(): void {


    this.modelo = {
      codigoTransaccion: this.codigoTransaccion};
  }


  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.motivoAuditoriaTransaccionService.crear(data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        this.spinnerService.hideGlobalSpinner();
        if (respuesta.isSuccess && respuesta.isSuccess == true) {
          this.toastr.success('Acción exitosa');
          this.activeModal.close();
        }
        else {
          this.toastr.error(cadenaErrores(respuesta.message));
          this.formulario.resetLoading();
        }
      },
      error: (error) => {
        this.toastr.error(cadenaErrores(error));
        this.formulario.resetLoading();
      }
    });
  }
  cerrar() {
    this.activeModal.close(); 
  }
}
