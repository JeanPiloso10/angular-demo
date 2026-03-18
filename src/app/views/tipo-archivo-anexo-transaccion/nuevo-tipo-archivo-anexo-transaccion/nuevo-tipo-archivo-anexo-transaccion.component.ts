import { Component, inject, ViewChild } from '@angular/core';
import { TipoArchivoAnexoTransaccionService } from '../tipo-archivo-anexo-transaccion.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormularioTipoArchivoAnexoTransaccionComponent } from '../formulario-tipo-archivo-anexo-transaccion/formulario-tipo-archivo-anexo-transaccion.component';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-nuevo-tipo-archivo-anexo-transaccion',
  standalone: false,
  templateUrl: './nuevo-tipo-archivo-anexo-transaccion.component.html',
  styleUrl: './nuevo-tipo-archivo-anexo-transaccion.component.scss'
})
export class NuevoTipoArchivoAnexoTransaccionComponent {


  @ViewChild(FormularioTipoArchivoAnexoTransaccionComponent) formulario: FormularioTipoArchivoAnexoTransaccionComponent;

  modelo: any;
  errores: string[] = [];
  entidad = 'tipoArchivoTransaccionAnexo';
  titulo: string;
  codigoTransaccion: any;

  public StateEnum = TipoAccion.Create;
  

  constructor(private tipoArchivoTransaccionService: TipoArchivoAnexoTransaccionService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService,
              private router: Router,
              private activeModal: NgbActiveModal) {
    this.titulo = "Crear Nuevo"
  }

  ngOnInit(): void {
  
    this.modelo = {
      codigoTransaccion: this.codigoTransaccion};
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.tipoArchivoTransaccionService.crear(data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
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

