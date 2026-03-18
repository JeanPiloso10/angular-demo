import { Component, inject, ViewChild } from '@angular/core';
import { MotivoAuditoriaService } from '../motivo-auditoria.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormularioMotivoAuditoriaComponent } from '../formulario-motivo-auditoria/formulario-motivo-auditoria.component';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-nuevo-motivo-auditoria',
  templateUrl: './nuevo-motivo-auditoria.component.html',
  styleUrl: './nuevo-motivo-auditoria.component.scss',
  standalone:false
})
export class NuevoMotivoAuditoriaComponent {

  @ViewChild(FormularioMotivoAuditoriaComponent) formulario: FormularioMotivoAuditoriaComponent;

  modelo: any;
  errores: string[] = [];
  entidad = 'motivoAuditoria';
  titulo: string;
  public StateEnum = TipoAccion.Create;

  constructor(private motivoAuditoriaService: MotivoAuditoriaService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService,
              private router: Router) {
    this.titulo = "Crear Nuevo"
  }

  ngOnInit(): void {
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.motivoAuditoriaService.crear(data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {
        this.spinnerService.hideGlobalSpinner();
        if (respuesta.isSuccess && respuesta.isSuccess == true) {
          this.toastr.success('Acción exitosa');
          this.motivoAuditoriaService.notificarActualizacion();
          // this.router.navigate(['/' + this.entidad + '/ver', data.idMotivoAuditoria]);
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



