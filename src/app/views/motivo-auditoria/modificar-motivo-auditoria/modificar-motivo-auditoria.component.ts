import { Component, inject, ViewChild } from '@angular/core';
import { MotivoAuditoriaService } from '../motivo-auditoria.service';
import { SpinnerService } from '@core/services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { FormularioMotivoAuditoriaComponent } from '../formulario-motivo-auditoria/formulario-motivo-auditoria.component';
import { TipoAccion } from '@shared/enums/TipoAccion';
import { cadenaErrores } from '@shared/utilities/parsearErrores';

@Component({
  selector: 'app-modificar-motivo-auditoria',
  templateUrl: './modificar-motivo-auditoria.component.html',
  styleUrl: './modificar-motivo-auditoria.component.scss',
  standalone:false
})
export class ModificarMotivoAuditoriaComponent {

  private routeSub: Subscription;
  @ViewChild(FormularioMotivoAuditoriaComponent) formulario: FormularioMotivoAuditoriaComponent;

  StateEnum = TipoAccion.Update;
  errores: string[] = [];
  entidad = 'motivoAuditoria';
  modelo: any;
  titulo: string;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private motivoAuditoriaService: MotivoAuditoriaService,
              private spinnerService: SpinnerService,
              private toastr: ToastrService) {

  }

  async ngOnInit() {
    this.spinnerService.showGlobalSpinner();
    try {
      this.routeSub = this.activatedRoute.params.subscribe(params => {
        const id = params['id'];
        if (id) {
          this.cargarDatos(id);
        } else {
          this.modelo = {};
        }
      });
    }
    catch (error) {
      this.spinnerService.hideGlobalSpinner();
      this.toastr.error('Error al cargar la página', 'Error');
    }
    finally {
      this.spinnerService.hideGlobalSpinner();
    }
  }
  private cargarDatos(id: number) {
    this.motivoAuditoriaService.consultaId(id).subscribe({
      next: (respuesta) => {
        if (respuesta.isSuccess) {
          this.modelo = respuesta.result;
        }
        else {
          this.modelo = {};
          this.toastr.warning(`No existe tipo archivo con descripción ingresada.`, 'Información del Sistema');
        }
      },
      error: (error) => {
        this.spinnerService.hideGlobalSpinner();
        this.toastr.error(cadenaErrores(error));
        this.router.navigate(['/' + this.entidad + '/ver'])
      }
    });
  }

  guardarCambios(data: any) {
    this.spinnerService.showGlobalSpinner();
    this.motivoAuditoriaService.editar(this.modelo.idMotivoAuditoria, data).pipe(
      finalize(() => this.spinnerService.hideGlobalSpinner())
    ).subscribe({
      next: (respuesta: any) => {

        this.spinnerService.hideGlobalSpinner();
        if (respuesta.isSuccess == true) {
          this.toastr.success('Acción exitosa');
          this.modelo = data;
          this.motivoAuditoriaService.notificarActualizacion();
          // this.router.navigate(['/'+this.entidad+'/ver', data.idMotivoAuditoria]);
          this.router.navigate(['/'+this.entidad+'/listado']);
        }
        else {
          this.toastr.error(cadenaErrores(respuesta.message));
          this.formulario.resetLoading();
        }
      },
      error: (error) => {
        this.spinnerService.hideGlobalSpinner();
        this.toastr.error(cadenaErrores(error));
        this.formulario.resetLoading();
      }
    });
  }
}
