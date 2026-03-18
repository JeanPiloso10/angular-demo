import { Component, inject, ViewChild } from '@angular/core';
import { TipoArchivoAnexoService } from '../tipo-archivo-anexo.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormularioTipoArchivoAnexoComponent } from '../formulario-tipo-archivo-anexo/formulario-tipo-archivo-anexo.component';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-nuevo-tipo-archivo-anexo',
  templateUrl: './nuevo-tipo-archivo-anexo.component.html',
  styleUrl: './nuevo-tipo-archivo-anexo.component.scss',
  standalone:false
})
export class NuevoTipoArchivoAnexoComponent {


  @ViewChild(FormularioTipoArchivoAnexoComponent) formulario: FormularioTipoArchivoAnexoComponent;

  modelo: any;
  errores: string[] = [];
  entidad = 'tipoArchivoAnexo';
  titulo: string;
  public StateEnum = TipoAccion.Create;

  constructor(private tipoArchivoService: TipoArchivoAnexoService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService,
              private router: Router) {
    this.titulo = "Crear Nuevo"
  }

  ngOnInit(): void {
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.tipoArchivoService.crear(data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta.isSuccess && respuesta.isSuccess == true) {
          this.toastr.success('Acción exitosa');
          this.tipoArchivoService.notificarActualizacion();
          this.router.navigate(['/'+this.entidad+'/listado']);
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
}


